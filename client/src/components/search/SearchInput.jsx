import { InputAdornment, TextField, Stack, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLazySearchUsersQuery } from "../../redux/service.js";
import { addToSearchedUsers } from "../../redux/slice";
import { Bounce, toast } from "react-toastify";

const SearchInput = () => {
  const { darkMode } = useSelector((state) => state.service);

  const [query, setQuery] = useState("");
  const [triggerSearch, { data, isLoading, error }] = useLazySearchUsersQuery();

  const dispatch = useDispatch();
  const _700 = useMediaQuery("(min-width:700px)");

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim().length > 0) {
        triggerSearch(query.trim());
      } else {
        dispatch(addToSearchedUsers([]));
      }
    }, 500); 

    return () => clearTimeout(delayedSearch);
  }, [query, triggerSearch, dispatch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    if (data && data.users) {
      dispatch(addToSearchedUsers(data.users));
      toast.success(data.msg, {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
    }
    if (error) {
      toast.error(error.data.msg, {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
    }
  }, [data, error, dispatch]);

  return (
    <>
      <Stack width={_700 ? "80%" : "90%"} maxWidth="700px" mx="auto" p={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by username and email"
          value={query}
          onChange={handleInputChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "15px",
              color: darkMode ? "whitesmoke" : "black",
              my:"70px"
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ color: darkMode ? "whitesmoke" : "black" }}
              >
                <FaSearch />
              </InputAdornment>
            ),
          }}
        />
        {isLoading && query && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>Searching...</p>
        )}
        {error && (
          <p style={{ textAlign: "center", marginTop: "10px", color: "red" }}>
            Error searching users
          </p>
        )}
      </Stack>
    </>
  );
};
export default SearchInput;