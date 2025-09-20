import { Stack, Typography } from "@mui/material";
import ProfileBar from "../../components/search/ProfileBar";
import SearchInput from "../../components/search/SearchInput";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { addToSearchedUsers } from "../../redux/slice";

const Search = () => {
  const { searchedUsers } = useSelector((state) => state.service);
  const dispatch = useDispatch();

  // Clear search results when component unmounts
  useEffect(() => {
    return () => {
      dispatch(addToSearchedUsers([]));
    };
  }, [dispatch]);

  return (
    <>
      <SearchInput />
      <Stack flexDirection={"column"} gap={1} mb={5} width={"100%"} mx={"auto"}>
        {searchedUsers && searchedUsers.length > 0 ? (
          searchedUsers.map((e) => {
            return <ProfileBar key={e.id} e={e} />;
          })
        ) : searchedUsers && searchedUsers.length === 0 ? (
          <Typography variant="h6" textAlign={"center"} mb={5}>
            No users found
          </Typography>
        ) : (
          <Typography variant="h6" textAlign={"center"} mb={5}>
            Start searching...
          </Typography>
        )}
      </Stack>
    </>
  );
};
export default Search;