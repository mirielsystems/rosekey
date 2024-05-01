<!--
## 1.x.x (unreleased)

### Note (Important Information)
-

### General
-

### Client(Frontend)
- 

### Server(Backend)
-

-->

## R6.0501 (unreleased)

### Security Fix
-  Merge pull request from GHSA-m9qf-3pfj-2r86「misskey-dev/misskey」 
-  Merge pull request from GHSA-2vxv-pv3m-3wvj「misskey-dev/misskey」
- この変更は必ず、アップデートしてください。

### Note (Important Information)
- （EN-US）PGroonga installation is mandatory from this version.
- （JA-JP）このバージョンから PGroongaのインストールが必須化されました。

### General
- Misskey 2024.3.1 (CherryPick 4.8.0)に追従
- 決済サービス(Stripe)がサーバー内でできるように。
- Mastodon APIを搭載
- ListenBrainzに対応
- PGroongaに対応
- メンションの最大数をロールごとに設定可能にする (misskey-dev/misskey #13343)

### Client(Frontend)
- Koruriを採用(数字や英語は Latoを採用)
- 年齢非表示機能を追加
- Fix(frontend): userActivationがない環境において不具合が生じる問題を修正 (misskey-dev/misskey)
- Fix: メニューが出るタイプのヘッダータブが押せない 
- feat(reversi): ゲーム中にリアクションを打てるように (misskey-dev/misskey PR #13119)
- Fix: チャットで絵文字ピッカーを開けなくなる問題を修正
- Feat: MusicBrainzの情報をリアルタイム更新するように。


### Server(Backend)
- Fix: Fix type incompatibility with MiChannelService<boolean>
- Fix: 禁止キーワードを含むノートがDelayed Queueに追加されて再処理される問題 (misskey-dev/misskey #13428) 
- enhance(backend): フォロー・フォロワー関連の通知の受信設定の強化 (misskey-dev/misskey #13468)
- refactor(backend): ノートのエクスポート処理でStreams APIを使うように (misskey-dev/misskey #13465)
- fix(backend): リノート時のHTLへのストリーミングの意図しない挙動を修正 (misskey-dev/misskey #13425)
- fix(backend): ダイレクトなノートに対してはダイレクトでしか返信できないように (misskey-dev/misskey #13477)
- fix: 型エラーを全修正
- fix(backend/UserSuspendService): 凍結・解凍の処理でfollowingテーブルの全てのデータをfetchしてしまいOOMになる問題を修正（MisskeyIO/misskey #598）
- fix(backend): 登録にメール認証が必須になっている場合、登録されているメールアドレスを削除できないように （MisskeyIO/misskey #606）