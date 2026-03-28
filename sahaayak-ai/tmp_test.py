from model.scam_detector import detect_scam
text='You won 50000 click here now'
score=detect_scam(text)
print('score', score)
print('classification', 'SCAM' if score >= 50 else 'SAFE')
