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
- メンションの最大数をロールごとに設定可能にする (misskey-dev/misskey #13343)

### Client(Frontend)
- Koruriを採用(数字や英語は Latoを採用)
- 年齢非表示機能を追加
- Fix(frontend): userActivationがない環境において不具合が生じる問題を修正 (misskey-dev/misskey)
- Fix: メニューが出るタイプのヘッダータブが押せない 
- feat(reversi): ゲーム中にリアクションを打てるように (misskey-dev/misskey PR #13119)


### Server(Backend)
- Fix: Fix type incompatibility with MiChannelService<boolean>
- Fix: 禁止キーワードを含むノートがDelayed Queueに追加されて再処理される問題 (misskey-dev/misskey #13428) 
- enhance(backend): フォロー・フォロワー関連の通知の受信設定の強化 (misskey-dev/misskey #13468)
- refactor(backend): ノートのエクスポート処理でStreams APIを使うように (misskey-dev/misskey #13465)
- fix(backend): リノート時のHTLへのストリーミングの意図しない挙動を修正 (misskey-dev/misskey #13425)
- fix(backend): ダイレクトなノートに対してはダイレクトでしか返信できないように (misskey-dev/misskey #13477)
