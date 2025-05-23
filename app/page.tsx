import { redirect } from 'next/navigation';

export default function Home() {
  // SM Activity 페이지로 리다이렉트
  redirect('/sm-activities');
}
