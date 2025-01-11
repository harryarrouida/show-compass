import SearchComponent from '@/components/searchComponent';
import DataGrid from '@/components/dataGrid';

export default function Home() {
  return (
    <main className="py-16 px-8 max-w-6xl mx-auto min-h-screen">
      <SearchComponent />
      <div className="mt-16">
        <DataGrid />
      </div>
    </main>
  );
}
