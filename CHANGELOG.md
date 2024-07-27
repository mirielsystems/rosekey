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

## Description
- CP or CherryPick: Modification of CherryPick(UPSTREAM)
- Mi or Misskey or misskey-dev/misskey: Significant changes to Misskey
- Cherry-Picked: Cherry-Picked from some project.
- LTS: Official stable version - future releases may not be available for a long time.

## R6.0729.LTS (unreleased)

### Note (Important Information)
- 今回のリリースはLTS版です。

### General
- CherryPick 4.9.0-beta.2 に追従(Misskey 2024.5.0)
- Mastodon API上で、ノートの編集ができるようになりました。

### Client(Frontend)
- PugをRosekey仕様にした。
- 猫耳の色を変更/連合できるようになりました
  - 連合するには Rosekey互換サーバーである必要があります。

### Server(Backend)
- Emailのstyleを変更
- IsIndexableを廃止し、noindexに変更


## R6.0609.LTS

### Note (Important Information)
- 今回のリリースはLTS版となります。

### General
-　Misskey 2024.5.0　(CherryPick 4.9.0-beta.1) に追従

### Server(Backend)
- Megalodon (Mastodon)の ルールなどの修正


## R6.0519 

### Note (Important Information)
- Node.js v20.12.2, 21.7.3 以降でしか動かないように。
- enhance(frontend): パスワード変更時にHIBPで流出パスワードをチェックするように (MisskeyIO#625)

### General
- Feat: 予約投稿機能

### Client(Frontend)
- Feat: モバイルUI変更 ([Cherry-Picked Yoiyami](https://github.com/yoiyami-dev/yoiyami/commit/7fb8eda97c4e9ed70a54836eee259dc5272aa010))

### Server(Backend)
- fix(backend)： Mastodonユーザーに会話を送るときに[#objectobject]タグが追加されることがある問題を修正 (CP)
- Feat: モデレーターを ブロック/ミュート/RNミュートできなくするオプションを追加。

## R6.0501

### Security Fix
-  Merge pull request from GHSA-m9qf-3pfj-2r86「misskey-dev/misskey」 
-  Merge pull request from GHSA-2vxv-pv3m-3wvj「misskey-dev/misskey」
- この変更は必ず、アップデートしてください。

### Note (Important Information)
- （EN-US）PGroonga installation is mandatory from this version.
- （JA-JP）このバージョンから PGroongaのインストールが必須化されました。
- バージョン管理形態の変更

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
