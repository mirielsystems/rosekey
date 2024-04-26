#!/bin/bash
### 16439sが作成しました。

# スクリプトがDebian 11以降で実行されているかチェック
if [ "$(lsb_release -is)" != "Debian" ] || [ "$(lsb_release -rs | cut -d. -f1)" -lt 11 ]; then
  echo "このスクリプトはDebian 11以降でのみ動作します。"
  exit 1
fi

# ユーザーがrootであるか確認
if [ "$(id -u)" -ne 0 ]; then
  echo "このスクリプトはrootユーザーとして実行する必要があります。"
  exit 1
fi

# Step 1: rose ユーザーの作成＆下準備
echo "1/5 ステップ1: roseユーザーの作成＆下準備を実行中..."
sudo adduser --disabled-password --disabled-login rose
sudo apt install -y sudo nano git wget curl ca-certificates gnupg2 lsb-release ubuntu-keyring build-essential gpg

# Step 2: Node.js のインストール
echo "2/5 ステップ2: Node.jsのインストールを実行中..."
sudo rm -f /usr/share/keyrings/nodesource.gpg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update
sudo apt install -y nodejs
corepack enable

# Step 3: PostgreSQLのインストール＆DB設定
echo "3/5 ステップ3: PostgreSQLのインストールと設定を実行中..."
sudo apt install -y postgresql-common
sudo sh /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -i -v 15
sudo systemctl enable --now postgresql
read -p "PostgreSQL ユーザー名: " PGUSER
read -p "PostgreSQL パスワード: " PGPASS
read -p "PostgreSQL DB名: " PGDB
sudo -u postgres psql -c "CREATE ROLE $PGUSER LOGIN PASSWORD '$PGPASS';"
sudo -u postgres psql -c "CREATE DATABASE $PGDB OWNER $PGUSER;"

# Step 4: Redis のインストール
echo "4/5 ステップ4: Redisのインストールを実行中..."
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install -y redis

# Step 5: Misskey Setup
echo "5/5 ステップ5: Misskeyのセットアップを実行中..."
sudo su - rose -c "git clone -b master https://code.16439s.dev/16439s/rosekey.git --recurse-submodules; pnpm install --frozen-lockfile; cp .config/example.yml .config/default.yml"

echo "すべてのセットアップが完了しました。あとは default.yml の編集などを行ってください。"
