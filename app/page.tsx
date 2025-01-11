import SearchComponent from '@/components/searchComponent';
import DataGrid from '@/components/dataGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-900/10 pt-10">
      <SearchComponent />
      <div className="w-full h-full mb-10">
        <DataGrid />
      </div>
    </main>
  );
}
