#!/bin/bash

echo "Copyright © 2023 @164-life All Rights Reserved."
sleep 1.5
clear

# ユーザーがrootであるか確認 (rootユーザーの場合はsudo権限の確認をスキップする。)
if [ "$EUID" -ne 0 ]; then
    # スクリプトがsudo権限で実行されているか確認
    if [ -z "$SUDO_USER" ]; then
        echo "このスクリプトを実行するにはsudo権限が必要です。sudoを使用して再度実行してください。"
        exit 1
    fi
fi

# OSを確認して、Debian 11以降またはUbuntu 20.04以降でなければ終了する。
if [ -f /etc/os-release ]; then
    source /etc/os-release
    if [[ "$ID" == "debian" && "$(echo "$VERSION_ID < 11" | bc)" -eq 0 ]] || [[ "$ID" == "ubuntu" && "$(echo "$VERSION_ID < 20.04" | bc)" -eq 0 ]]; then
        echo "サポートされているOSです。Node.jsのインストールを開始します。"
    else
        echo "このOSはサポートされていないか、バージョンが古いため、スクリプトを終了します。"
        exit 1
    fi
else
    echo "このスクリプトはDebian 11 Ubuntu 20.04 LTS 以降でのみサポートされています。スクリプトを終了します。"
    exit 1
fi

echo "Node.js のバージョンを選択してください:"
echo "1. Node.js v21"
echo "2. Node.js v20"
echo "3. Node.js v18 LTS"
echo "4. Node.js v16"

read -p "番号を入力してください (1-4): " choice

case $choice in
    1)
        NODE_MAJOR=21
        ;;
    2)
        NODE_MAJOR=20
        ;;
    3)
        NODE_MAJOR=18
        ;;
    4)
        NODE_MAJOR=16
        ;;
    *)
        echo "無効な選択です。スクリプトを終了します。"
        exit 1
        ;;
esac

# Node.jsのインストール
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/nodesource.gpg
echo "deb [signed-by=/etc/apt/trusted.gpg.d/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update && sudo apt-get install -y nodejs

# インストールが完了したか確認
node -v
npm -v

echo "Node.js v$NODE_MAJOR がインストールされました。"
