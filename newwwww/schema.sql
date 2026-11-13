-- Supabase → SQL Editor এ পুরোটা paste করে Run করো
create table profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text not null, phone text,
  role text not null default 'patient' check (role in ('patient','doctor','admin')),
  created_at timestamptz default now());

create table doctors(
  id uuid primary key references profiles on delete cascade,
  name text not null, specialty text not null, bmdc text,
  division text not null, district text not null, chamber text,
  fee int default 500, bio text, approved boolean default false,
  days int[] default '{0,1,2,3,4,6}',            -- 0=রবি ... 6=শনি
  slots text[] default '{"17:00","17:30","18:00","18:30","19:00","19:30"}');

create table appointments(
  id bigint generated always as identity primary key,
  doctor_id uuid not null references doctors on delete cascade,
  patient_id uuid not null references profiles on delete cascade,
  patient_name text, patient_phone text,
  appt_date date not null, appt_time text not null, note text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','done')),
  created_at timestamptz default now());
-- একই ডাক্তারের একই সময়ে দুইবার বুকিং ঠেকায়
create unique index one_slot on appointments(doctor_id, appt_date, appt_time) where status <> 'cancelled';

create function is_admin() returns boolean language sql security definer set search_path=public stable as
$$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;

-- signup এ profile (ও ডাক্তার হলে doctors row) নিজে তৈরি হয়। কেউ নিজেকে admin বানাতে পারবে না।
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare m jsonb := new.raw_user_meta_data;
        r text := case when m->>'role'='doctor' then 'doctor' else 'patient' end;
begin
  insert into profiles(id,full_name,phone,role) values(new.id, coalesce(m->>'full_name','User'), m->>'phone', r);
  if r='doctor' then
    insert into doctors(id,name,specialty,bmdc,division,district,chamber,fee) values(
      new.id, coalesce(m->>'full_name','Doctor'), coalesce(m->>'specialty','মেডিসিন'), m->>'bmdc',
      coalesce(m->>'division','Dhaka'), coalesce(m->>'district','Dhaka'), m->>'chamber',
      coalesce(nullif(m->>'fee','')::int,500));
  end if;
  return new;
end $$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

-- শুধু admin approve করতে পারবে
create function guard_doctor() returns trigger language plpgsql security definer set search_path=public as $$
begin if not is_admin() then new.approved := old.approved; end if; return new; end $$;
create trigger guard_doc before update on doctors for each row execute function guard_doctor();

-- রোগী শুধু নিজের appointment cancel করতে পারবে
create function guard_appt() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid()=old.patient_id and not is_admin() and new.status<>old.status and new.status<>'cancelled'
  then raise exception 'not allowed'; end if;
  return new;
end $$;
create trigger guard_ap before update on appointments for each row execute function guard_appt();

-- কোন slot বুক হয়ে গেছে (কার দ্বারা তা না দেখিয়ে)
create function taken_slots(doc uuid, d date) returns table(t text) language sql security definer set search_path=public stable as
$$ select appt_time from appointments where doctor_id=doc and appt_date=d and status<>'cancelled' $$;

alter table profiles enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;

create policy p_sel on profiles for select using (id=auth.uid() or is_admin());

create policy d_sel on doctors for select using (approved or id=auth.uid() or is_admin());
create policy d_upd on doctors for update using (id=auth.uid() or is_admin()) with check (id=auth.uid() or is_admin());
create policy d_del on doctors for delete using (is_admin());

create policy a_sel on appointments for select using (patient_id=auth.uid() or doctor_id=auth.uid() or is_admin());
create policy a_ins on appointments for insert with check (
  patient_id=auth.uid() and exists(select 1 from doctors d where d.id=doctor_id and d.approved));
create policy a_upd on appointments for update using (patient_id=auth.uid() or doctor_id=auth.uid() or is_admin());
