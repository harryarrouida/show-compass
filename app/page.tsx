import PageLayout from '@/components/layout/PageLayout';
import SearchComponent from '@/components/searchComponent';
import DataGrid from '@/components/dataGrid';

export default function Home() {
    return (
        <PageLayout>
            <div className="space-y-16">
                <div>
                    <SearchComponent />
                </div>

                <div>
                    <DataGrid />
                </div>
            </div>
        </PageLayout>
    );
}
