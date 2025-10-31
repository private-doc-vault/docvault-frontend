import { useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search as SearchIcon } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectQuery, setQuery } from '../../features/search/searchSlice';
import useDebounce from '../../hooks/useDebounce';

/**
 * SearchBar - Search input component
 * Provides text input for search queries with optional debounced auto-search
 */
const SearchBar = ({ onSearch, autoSearch = true, debounceDelay = 500 }) => {
  const dispatch = useDispatch();
  const query = useSelector(selectQuery);
  const debouncedQuery = useDebounce(query, debounceDelay);

  /**
   * Trigger search automatically when debounced query changes
   */
  useEffect(() => {
    if (autoSearch && onSearch && debouncedQuery !== undefined) {
      onSearch();
    }
  }, [debouncedQuery, autoSearch, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  };

  const handleChange = (e) => {
    dispatch(setQuery(e.target.value));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup size="lg">
        <Form.Control
          type="text"
          placeholder="Search documents by filename, content, or tags..."
          value={query}
          onChange={handleChange}
          aria-label="Search query"
        />
        <Button variant="primary" type="submit" disabled={!query.trim()}>
          <SearchIcon className="me-2" />
          Search
        </Button>
      </InputGroup>
      {autoSearch && (
        <Form.Text className="text-muted mt-1">
          Search automatically as you type
        </Form.Text>
      )}
    </Form>
  );
};

export default SearchBar;
