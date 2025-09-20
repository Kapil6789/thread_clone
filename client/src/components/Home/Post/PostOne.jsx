import {
  Avatar,
  AvatarGroup,
  Badge,
  Stack,
  Stepper,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";

const PostOne = ({ e }) => {
  const _700 = useMediaQuery("(min-width:700px)");

  // derive safe fields
  const adminId = e?.admin?.id ?? e?.admin?._id ?? e?.adminId ?? "";
  const profileLink = adminId ? `/profile/threads/${adminId}` : "#";
  const adminUsername = e?.admin?.username ?? e?.admin?.userName ?? ""; // fixed fallback
  const adminProfilePic = e?.admin?.profilePic ?? "";

  const comments = Array.isArray(e?.comments) ? e.comments : [];
  const firstAuthor = comments[0]?.author ?? comments[0]?.admin ?? null;
  const secondAuthor = comments[1]?.author ?? comments[1]?.admin ?? null;

  return (
    <>
      <Stack
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Link to={profileLink}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Avatar
                alt="+"
                src=""
                sx={{
                  width: _700 ? 20 : 14,
                  height: _700 ? 20 : 14,
                  bgcolor: "green",
                  position: _700 ? "relative" : "initial",
                  right: _700 ? 4 : 0,
                  bottom: _700 ? 4 : 0,
                }}
              >
                {" "}
                +{" "}
              </Avatar>
            }
          >
            <Avatar
              alt={adminUsername}
              src={adminProfilePic}
              sx={{ width: _700 ? 40 : 32, height: _700 ? 40 : 32 }}
            />
          </Badge>
        </Link>
        <Stack
          flexDirection={"column"}
          alignItems={"center"}
          gap={2}
          height={"100%"}
        >
          <Stepper
            orientation={"vertical"}
            activeStep={0}
            sx={{
              border: "0.1rem solid gray",
              width: "0px",
              height: "100%",
            }}
          ></Stepper>

          {comments.length > 0 ? (
            <AvatarGroup
              total={comments.length}
              sx={{
                "& .MuiAvatar-root": {
                  width: _700 ? 24 : 16,
                  height: _700 ? 24 : 16,
                  fontSize: _700 ? 12 : 8,
                },
              }}
            >
              <Avatar
                src={firstAuthor?.profilePic ?? ""}
                alt={firstAuthor?.username ?? firstAuthor?.userName ?? ""} // fixed fallback
              />
              {comments.length > 1 ? (
                <Avatar
                  src={secondAuthor?.profilePic ?? ""}
                  alt={secondAuthor?.username ?? secondAuthor?.userName ?? ""} // fixed fallback
                />
              ) : null}
            </AvatarGroup>
          ) : (
            ""
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default PostOne;