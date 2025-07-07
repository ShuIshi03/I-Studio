/*
  # 日本語メールテンプレート設定用SQL

  このファイルは参考用です。実際の設定はSupabaseダッシュボードで行う必要があります。

  ## Supabaseダッシュボードでの設定手順:

  1. Supabaseプロジェクトのダッシュボードにアクセス
  2. Authentication > Email Templates に移動
  3. 以下のテンプレートを日本語に変更:

  ### Confirm signup (アカウント確認)
  Subject: I Studio 予約システム - アカウント確認
  
  Body:
  こんにちは、

  I Studio 予約システムへのご登録ありがとうございます。

  以下のリンクをクリックしてアカウントを有効化してください：
  <a href="{{ .ConfirmationURL }}">アカウントを確認する</a>

  このリンクは24時間有効です。

  I Studio 予約システム

  ### Magic Link (マジックリンク)
  Subject: I Studio 予約システム - ログインリンク
  
  Body:
  こんにちは、

  以下のリンクをクリックしてログインしてください：
  <a href="{{ .ConfirmationURL }}">ログインする</a>

  このリンクは1時間有効です。

  I Studio 予約システム

  ### Change Email Address (メールアドレス変更)
  Subject: I Studio 予約システム - メールアドレス変更確認
  
  Body:
  こんにちは、

  メールアドレスの変更を確認するため、以下のリンクをクリックしてください：
  <a href="{{ .ConfirmationURL }}">メールアドレス変更を確認する</a>

  I Studio 予約システム

  ### Reset Password (パスワードリセット)
  Subject: I Studio 予約システム - パスワードリセット
  
  Body:
  こんにちは、

  パスワードをリセットするため、以下のリンクをクリックしてください：
  <a href="{{ .ConfirmationURL }}">パスワードをリセットする</a>

  このリンクは1時間有効です。

  I Studio 予約システム
*/

-- このファイルは実際には実行されません
-- Supabaseダッシュボードでの手動設定が必要です
SELECT 'Supabaseダッシュボードでメールテンプレートを日本語に設定してください' as message;