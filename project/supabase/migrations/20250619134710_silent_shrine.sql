/*
  # メール確認プロセスの修正

  1. 変更点
    - プロフィール作成のRLSポリシーを修正
    - メール確認前でもプロフィール作成を許可
    - 認証状態の変更を適切に処理

  2. セキュリティ
    - 認証されたユーザーのみがプロフィールを作成可能
    - ユーザーは自分のプロフィールのみ操作可能
*/

-- プロフィール作成ポリシーを更新（メール確認前でも作成可能にする）
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 既存のプロフィール読み取りポリシーも更新
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);