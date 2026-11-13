"""Kaggle 'Disease Prediction Using Machine Learning' (Training.csv) থেকে model.js বানায়।
Training.csv: কলামে 0/1 symptom, শেষ কলাম 'prognosis' (রোগের নাম)।
চালানো: pip install pandas scikit-learn
        python train_model.py Training.csv Testing.csv
"""
import sys, json, pandas as pd
from sklearn.naive_bayes import BernoulliNB
from sklearn.metrics import accuracy_score

train = pd.read_csv(sys.argv[1]).dropna(axis=1, how="all")
X, y = train.drop(columns="prognosis"), train["prognosis"]

if len(sys.argv) > 2:  # accuracy যাচাই (paper এ রিপোর্ট করার জন্য)
    test = pd.read_csv(sys.argv[2])
    clf = BernoulliNB().fit(X, y)
    print("Accuracy:", accuracy_score(test["prognosis"], clf.predict(test[X.columns])))

# ঐচ্ছিক: বাংলা নাম (এখানে নিজে যোগ করো, না দিলে ইংরেজি নামই দেখাবে)
BN_SYMPTOM = {"itching": "চুলকানি", "skin_rash": "চামড়ায় র‍্যাশ", "vomiting": "বমি", "headache": "মাথাব্যথা"}
BN_DISEASE = {"Malaria": "ম্যালেরিয়া", "Dengue": "ডেঙ্গু", "Typhoid": "টাইফয়েড", "Diabetes ": "ডায়াবেটিস"}
SPEC = {"Malaria": "মেডিসিন বিশেষজ্ঞ", "Dengue": "মেডিসিন বিশেষজ্ঞ", "Diabetes ": "এন্ডোক্রাইনোলজিস্ট"}  # বাকিগুলো যোগ করো

symptoms = {c: [BN_SYMPTOM.get(c, c.replace("_", " ")), c.replace("_", " ")] for c in X.columns}
diseases = {}
for d, g in train.groupby("prognosis"):
    p = (g[X.columns].sum() + 1) / (len(g) + 2)          # Laplace smoothing
    diseases[d] = {"bn": BN_DISEASE.get(d, d), "spec": SPEC.get(d, "মেডিসিন বিশেষজ্ঞ"),
                   "s": {k: round(float(v), 3) for k, v in p.items() if v > 0.3}}
model = {"symptoms": symptoms, "red_flags": ["breathlessness", "chest_pain"], "diseases": diseases}
open("../model.js", "w", encoding="utf-8").write("window.MODEL = " + json.dumps(model, ensure_ascii=False) + ";")
print("model.js তৈরি হয়েছে →", len(diseases), "টি রোগ")
