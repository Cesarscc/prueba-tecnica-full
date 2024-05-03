import { useEffect, useState } from "react"
import { Data } from "../types"
import { searchData } from "../services/search";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

const DEBOUNCE_TIME = 350

export const Search = ({ initalData }: { initalData: Data }) => {

    const [data, setData] = useState<Data>(initalData);
    const [search, setSearch] = useState<string>(() => {
        const searchParams = new URLSearchParams(window.location.search)
        return searchParams.get('q') ?? ''
    });

    const debounceSearch = useDebounce(search, DEBOUNCE_TIME);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    }

    useEffect(() => {

        const newPathname = debounceSearch === '' ? window.location.pathname : `?q=${debounceSearch}`;
        window.history.replaceState({}, '', newPathname)

    }, [debounceSearch])

    useEffect(() => {

        if (!debounceSearch) {
            setData(initalData);
            return
        }

        searchData(debounceSearch)
            .then(response => {
                const [err, newData] = response;
                if (err) {
                    toast.error(err.message);
                    return
                }
                if (newData) {
                    setData(newData);
                }
            })
    }, [debounceSearch, initalData])

    return (
        <div>
            <h1>Search</h1>
            <form>
                <input onChange={handleSearch} type="search" placeholder="Buscar información" defaultValue={search} />
            </form>
            <ul>
                {
                    data.map((row) => (
                        <li key={row.id}>
                            <article>
                                {Object
                                    .entries(row)
                                    .map(([key, value]) =>
                                        <p key={key}>
                                            <strong>{key}:</strong>
                                            {value}
                                        </p>
                                    )}
                            </article>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}