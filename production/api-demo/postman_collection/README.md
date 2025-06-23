**Postmanにインポートする手順：**
1. jsonファイルにapiKeyとsecretを自分のものに入れ替える  
2. jsonファイルをPostmanにインポート(file>Import)する  
3. getUnitsを実行して、レスポンス結果より、lockIdをgetLockStatusとunlockに入れ替える  

※「SSL Error: Certificate has expired」の対応方法：Postmanのバージョンをv9.0.5以上にアップしてください。
