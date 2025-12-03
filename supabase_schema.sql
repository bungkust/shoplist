-- 1. Buat Tabel Profiles (Public) yang link ke Auth.Users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  household_id UUID DEFAULT gen_random_uuid(), -- ID unik keluarga
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Trigger Otomatis: Saat User Signup, buat Profile baru
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, household_id)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', gen_random_uuid());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Tabel Induk Daftar (list_master)
CREATE TABLE public.list_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- Contoh: "Belanja Mingguan"
  household_id UUID NOT NULL, -- Semua yang satu household bisa lihat
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabel Item Belanja Aktif (shopping_items)
CREATE TABLE public.shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.list_master(id) ON DELETE CASCADE,
  
  -- Data Hasil Parsing Suara
  item_name TEXT NOT NULL, -- Contoh: "Beras"
  quantity NUMERIC DEFAULT 1, -- Contoh: 5
  unit TEXT DEFAULT 'pcs', -- Contoh: "kg"
  
  -- Status
  is_purchased BOOLEAN DEFAULT FALSE,
  
  -- Meta
  household_id UUID NOT NULL, -- Untuk Realtime Sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel Riwayat & Harga (transaction_history)
CREATE TABLE public.transaction_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  
  -- Detail Barang
  item_name TEXT NOT NULL, -- "Beras"
  final_price NUMERIC NOT NULL, -- Rp 65.000
  
  -- Data untuk Komparasi Unit
  total_size NUMERIC NOT NULL, -- 5 (dari 5 kg)
  base_unit TEXT NOT NULL, -- "kg"
  
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Keamanan Data (Row Level Security - RLS)

-- Aktifkan RLS di semua tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- Policy: User hanya bisa lihat data yang household_id-nya SAMA dengan miliknya

-- Profiles: User bisa lihat profile sendiri
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR ALL 
USING (id = auth.uid());

-- List Master
CREATE POLICY "Users can see lists in their household" 
ON public.list_master FOR ALL 
USING (
  household_id IN (
    SELECT household_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Shopping Items
CREATE POLICY "Users can see items in their household" 
ON public.shopping_items FOR ALL 
USING (
  household_id IN (
    SELECT household_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Transaction History
CREATE POLICY "Users can see history in their household" 
ON public.transaction_history FOR ALL 
USING (
  household_id IN (
    SELECT household_id FROM public.profiles WHERE id = auth.uid()
  )
);
