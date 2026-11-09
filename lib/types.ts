export type Board = "biz" | "resident";

export type Post = {
  id: number;
  board: Board;
  category: string;
  region: string;
  country: string;
  company: string;
  title: string;
  body: string;
  author_name: string;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: "none" | "admin";
  created_at: string;
};

export type Inquiry = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  region: string;
  message: string;
  status: "new" | "in_progress" | "done";
  memo: string;
  created_at: string;
};

export type Viewer = {
  userId: string;
  email: string;
  profile: Profile | null;
  isAdmin: boolean;
};
