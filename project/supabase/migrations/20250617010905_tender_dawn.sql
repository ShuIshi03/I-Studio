/*
  # I Studio予約システム初期スキーマ

  1. 新しいテーブル
    - `profiles` - ユーザープロフィール情報
      - `id` (uuid, primary key, auth.users.idと連携)
      - `name` (text)
      - `email` (text)
      - `role` (text) - 'student', 'teacher', 'admin'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `subjects` - 科目情報
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `shifts` - シフト情報
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, foreign key to profiles)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `subjects` (text array) - 科目IDの配列
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reservations` - 予約情報
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to profiles)
      - `shift_id` (uuid, foreign key to shifts)
      - `subject_id` (uuid, foreign key to subjects)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `notes` (text)
      - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. セキュリティ
    - 各テーブルでRLSを有効化
    - 適切なポリシーを設定
*/

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 科目テーブル
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- シフトテーブル
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  subjects text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 予約テーブル
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES shifts(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- プロフィールのポリシー
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 科目のポリシー
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can insert subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- シフトのポリシー
CREATE POLICY "Anyone can read shifts"
  ON shifts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage own shifts"
  ON shifts
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all shifts"
  ON shifts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 予約のポリシー
CREATE POLICY "Students can read own reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can read reservations for their shifts"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shifts 
      WHERE shifts.id = reservations.shift_id 
      AND shifts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Students can insert own reservations"
  ON reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can update reservations for their shifts"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shifts 
      WHERE shifts.id = reservations.shift_id 
      AND shifts.teacher_id = auth.uid()
    )
  );

-- デフォルト科目を挿入
INSERT INTO subjects (name) VALUES 
  ('数学'),
  ('物理'),
  ('化学'),
  ('プログラミング'),
  ('英語')
ON CONFLICT (name) DO NOTHING;

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新日時トリガーを設定
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at 
  BEFORE UPDATE ON shifts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
  BEFORE UPDATE ON reservations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();