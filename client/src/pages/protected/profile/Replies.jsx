import { Stack, Typography, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import Comments from "../../../components/Home/Post/Comments";

const Replies = () => {
  const { user } = useSelector((state) => state.service);
  const _700 = useMediaQuery("(min-width:700px)");
  return (
    <>
      <Stack
        flexDirection={"column"}
        gap={2}
        width={_700 ? "800px" : "90%"}
        mx={"auto"}
      >
        {user ? (
          user.user ? (
            user.user.replies.length > 0 ? (
              user.user.replies.map((e) => {
                return <Comments key={e._id} e={e} postId={e.post} />;
              })
            ) : (
              <Typography textAlign={"center"} variant="h6">
                No Replies yet !
              </Typography>
            )
          ) : null
        ) : null}
      </Stack>
    </>
  );
};

export default Replies;