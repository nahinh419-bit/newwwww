// Demo knowledge base. পরে train/train_model.py দিয়ে Kaggle dataset থেকে এই ফাইল নতুন করে বানাতে পারবে।
window.MODEL = {
 symptoms: {
  fever:["জ্বর","fever jor"], high_fever:["অনেক বেশি জ্বর (১০২°F+)","high fever tiber jor"],
  chills:["কাঁপুনি দিয়ে জ্বর","chills kapuni"], cough:["কাশি","cough kashi"],
  long_cough:["৩ সপ্তাহের বেশি কাশি","long cough"], blood_cough:["কাশিতে রক্ত","blood cough"],
  runny_nose:["নাক দিয়ে পানি পড়া","runny nose"], sneezing:["হাঁচি","sneezing hachi"],
  sore_throat:["গলা ব্যথা","sore throat"], headache:["মাথাব্যথা","headache mathabytha"],
  body_ache:["শরীর ব্যথা","body ache"], joint_pain:["হাড়/গিঁটে ব্যথা","joint pain"],
  eye_pain:["চোখের পেছনে ব্যথা","pain behind eyes"], fatigue:["দুর্বলতা / ক্লান্তি","fatigue weakness"],
  vomiting:["বমি","vomiting"], nausea:["বমি বমি ভাব","nausea"], diarrhea:["পাতলা পায়খানা","diarrhea"],
  abdominal_pain:["পেট ব্যথা","stomach pain"], acidity:["বুক জ্বালা / গ্যাস","acidity gas"],
  loss_appetite:["ক্ষুধামন্দা","loss of appetite"], rash:["চামড়ায় র‍্যাশ","rash"],
  itching:["চুলকানি","itching"], blisters:["ফোসকা / গুটি","blisters"],
  breathless:["শ্বাসকষ্ট","breathlessness"], wheezing:["বুকে শাঁ শাঁ শব্দ","wheezing"],
  chest_pain:["বুকে ব্যথা","chest pain"], dizziness:["মাথা ঘোরা","dizziness"],
  freq_urine:["ঘন ঘন প্রস্রাব","frequent urination"], burn_urine:["প্রস্রাবে জ্বালা","burning urination"],
  thirst:["অতিরিক্ত পিপাসা","excess thirst"], weight_loss:["ওজন কমে যাওয়া","weight loss"],
  blur_vision:["ঝাপসা দেখা","blurred vision"], yellow:["চোখ/ত্বক হলুদ","jaundice yellow"],
  dark_urine:["গাঢ় হলুদ প্রস্রাব","dark urine"], night_sweat:["রাতে ঘাম","night sweats"],
  light_sens:["আলোতে অস্বস্তি","light sensitivity"]
 },
 red_flags:["breathless","chest_pain","blood_cough"],
 diseases:{
  cold:{bn:"সাধারণ সর্দি-কাশি",spec:"মেডিসিন / সাধারণ চিকিৎসক",s:{runny_nose:.9,sneezing:.8,sore_throat:.7,cough:.7,fever:.3,headache:.3}},
  flu:{bn:"ইনফ্লুয়েঞ্জা (ফ্লু)",spec:"মেডিসিন বিশেষজ্ঞ",s:{fever:.9,body_ache:.8,cough:.8,fatigue:.7,headache:.6,chills:.5,sore_throat:.5}},
  dengue:{bn:"ডেঙ্গু",spec:"মেডিসিন বিশেষজ্ঞ (দ্রুত রক্ত পরীক্ষা: NS1/CBC)",s:{high_fever:.9,eye_pain:.7,joint_pain:.7,headache:.7,rash:.5,body_ache:.7,vomiting:.4,fatigue:.5}},
  typhoid:{bn:"টাইফয়েড",spec:"মেডিসিন বিশেষজ্ঞ",s:{fever:.9,abdominal_pain:.6,headache:.5,loss_appetite:.6,fatigue:.6,diarrhea:.3,nausea:.4}},
  malaria:{bn:"ম্যালেরিয়া",spec:"মেডিসিন বিশেষজ্ঞ",s:{chills:.9,high_fever:.7,headache:.6,vomiting:.5,body_ache:.5,fatigue:.5}},
  gastritis:{bn:"গ্যাস্ট্রিক / অ্যাসিডিটি",spec:"গ্যাস্ট্রোএন্টেরোলজিস্ট",s:{acidity:.9,abdominal_pain:.8,nausea:.6,vomiting:.4,loss_appetite:.5}},
  gastro:{bn:"ডায়রিয়া / ফুড পয়জনিং",spec:"মেডিসিন / গ্যাস্ট্রোএন্টেরোলজিস্ট",s:{diarrhea:.95,vomiting:.7,abdominal_pain:.7,nausea:.6,fever:.4,fatigue:.4}},
  jaundice:{bn:"জন্ডিস / হেপাটাইটিস",spec:"হেপাটোলজিস্ট / গ্যাস্ট্রোএন্টেরোলজিস্ট",s:{yellow:.95,dark_urine:.8,fatigue:.6,loss_appetite:.6,nausea:.5,abdominal_pain:.4}},
  diabetes:{bn:"ডায়াবেটিস",spec:"এন্ডোক্রাইনোলজিস্ট / ডায়াবেটোলজিস্ট",s:{freq_urine:.85,thirst:.85,weight_loss:.6,fatigue:.6,blur_vision:.5}},
  asthma:{bn:"হাঁপানি (অ্যাজমা)",spec:"বক্ষব্যাধি বিশেষজ্ঞ",s:{breathless:.9,wheezing:.9,cough:.7,chest_pain:.3}},
  pneumonia:{bn:"নিউমোনিয়া",spec:"বক্ষব্যাধি বিশেষজ্ঞ",s:{high_fever:.7,cough:.9,breathless:.8,chest_pain:.6,chills:.5,fatigue:.5}},
  tb:{bn:"যক্ষ্মা (টিবি)",spec:"বক্ষব্যাধি বিশেষজ্ঞ",s:{long_cough:.95,blood_cough:.5,weight_loss:.7,night_sweat:.7,fever:.6,fatigue:.5}},
  uti:{bn:"মূত্রনালীর সংক্রমণ (UTI)",spec:"ইউরোলজিস্ট / মেডিসিন",s:{burn_urine:.95,freq_urine:.8,abdominal_pain:.5,fever:.4}},
  migraine:{bn:"মাইগ্রেন",spec:"নিউরোলজিস্ট",s:{headache:.95,light_sens:.8,nausea:.7,vomiting:.5,dizziness:.4}},
  allergy:{bn:"অ্যালার্জি",spec:"মেডিসিন / চর্মরোগ বিশেষজ্ঞ",s:{itching:.85,rash:.8,sneezing:.7,runny_nose:.5}},
  chickenpox:{bn:"জলবসন্ত",spec:"চর্মরোগ / মেডিসিন",s:{blisters:.95,itching:.8,rash:.8,fever:.6,fatigue:.4}}
 }
};
