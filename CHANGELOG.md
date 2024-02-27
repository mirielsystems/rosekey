<!--
## 1.x.x (unreleased)

### General
-

### Client(Frontend)
- 

### Server(Backend)
-

-->

## 1.0.0 (unreleased)

### General
- 決済サービス(Stripe)がサーバー内でできるように。
- ListenBranzに対応

### Client(Frontend)
- Koruriを採用(数字や英語は Latoを採用)
- 年齢非表示機能を追加
- Fix(frontend): userActivationがない環境において不具合が生じる問題を修正 (misskey-dev/misskey)
- Fix: メニューが出るタイプのヘッダータブが押せない 


### Server(Backend)
- Fix: Fix type incompatibility with MiChannelService<boolean>
- Fix: 禁止キーワードを含むノートがDelayed Queueに追加されて再処理される問題 (misskey-dev/misskey #13428) 