// Search.tsx
import React, { ChangeEvent, useState } from 'react';

export type SearchProps = {
    onSearch: (value: string) => void
}

const Search = (props: SearchProps) => {
    const { onSearch } = props;
    const [value, setValue] = useState('');

    const searchHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onSearch(value);
        }
    };

    return (
        <div className="relative w-full text-gray-600">
            <input
                type="search"
                name="search"
                placeholder="Enter search..."
                className="bg-white bg-opacity-20 h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
                style={{
                    width: '100%',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderRadius: '50px',
                    background: 'rgba(255, 255, 255, 0.3)'  // Asigură o transparență ușoară
                }}
                onChange={searchHandler}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default Search;
