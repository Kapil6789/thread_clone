import { Stack, Typography, useMediaQuery } from "@mui/material";
import { FaRegHeart, FaRegComment, FaRetweet, FaHeart } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useLikePostMutation,useRepostMutation } from "../../../redux/service.js";

import { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";

const PostTwo = ({ e }) => {
  const { darkMode, myInfo } = useSelector((state) => state.service);

  const [likePost] = useLikePostMutation();
  const [repost, repostData] = useRepostMutation();

  const [isLiked, setIsLiked] = useState(false);

  const _300 = useMediaQuery("(min-width:300px)");
  const _400 = useMediaQuery("(min-width:400px)");
  const _500 = useMediaQuery("(min-width:500px)");
  const _700 = useMediaQuery("(min-width:700px)");

  // derive safe values
  const postId = e?.id ?? e?._id ?? null;
  const adminUsername = e?.admin?.username ?? e?.admin?.userName ?? "";

  const handleLike = async () => {
    if (!postId) return;
    await likePost(postId);
  };

  const checkIsLiked = () => {
    const myUserId = myInfo?.id ?? myInfo?._id;
    if (!myUserId || !Array.isArray(e?.likes)) {
      setIsLiked(false);
      return;
    }
    const liked = e.likes.some((like) => {
      const likerId =
        like?.user?.id ??
        like?.user?._id ??
        like?.userId ??
        like?.id ??
        like?._id;
      return likerId === myUserId;
    });
    setIsLiked(!!liked);
  };

  const handleRepost = async () => {
    if (!postId) return;
    await repost(postId);
  };

  useEffect(() => {
    checkIsLiked();
  }, [e, myInfo]);

  useEffect(() => {
    if (repostData.isSuccess) {
      toast.success(repostData.data.msg, {
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
    if (repostData.isError) {
      toast.success(repostData.error.data.msg, {
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
  }, [repostData.isSuccess, repostData.isError]);

  return (
    <>
      <Stack flexDirection={"column"} justifyContent={"space-between"}>
        <Stack flexDirection={"column"} gap={2}>
          <Stack flexDirection={"column"}>
            <Typography
              variant="h6"
              fontSize={_300 ? "1rem" : "0.8rem"}
              fontWeight={"bold"}
            >
              {adminUsername}
            </Typography>
            <Link to={`/post/${postId ?? ""}`} className="link">
              <Typography
                variant="h5"
                fontSize={
                  _700 ? "1.2rem" : _400 ? "1rem" : _300 ? "0.9rem" : "0.8rem"
                }
                className={darkMode ? "mode" : ""}
              >
                {e ? e.text : ""}
              </Typography>
            </Link>
          </Stack>
          {e ? (
            e.media ? (
              <img
                src={e?.media}
                alt={e?.media}
                loading="lazy"
                width={
                  _700
                    ? "400px"
                    : _500
                    ? "350px"
                    : _400
                    ? "250px"
                    : _300
                    ? "180px"
                    : "150px"
                }
                height={"auto"}
              />
            ) : null
          ) : null}
        </Stack>
        <Stack flexDirection={"column"} gap={1}>
          <Stack flexDirection={"row"} gap={2} m={1}>
            {isLiked ? (
              <FaHeart size={_700 ? 32 : _300 ? 28 : 24} onClick={handleLike} />
            ) : (
              <FaRegHeart
                size={_700 ? 32 : _300 ? 28 : 24}
                onClick={handleLike}
              />
            )}

            <Link to={`/post/${postId ?? ""}#comment`} className="link">
              <FaRegComment size={_700 ? 32 : _300 ? 28 : 24} />
            </Link>
            <FaRetweet
              size={_700 ? 32 : _300 ? 28 : 24}
              onClick={handleRepost}
            />
            <IoMdSend size={_700 ? 32 : _300 ? 28 : 24} />
          </Stack>
          <Stack
            flexDirection={"row"}
            gap={1}
            position={"relative"}
            top={-3}
            left={4}
          >
            {e?.likes?.length > 0 ? (
              <Typography
                variant="caption"
                color={darkMode ? "white" : "GrayText"}
                fontSize={_700 ? "1.1rem" : "1rem"}
              >
                {e.likes.length} likes .
              </Typography>
            ) : (
              ""
            )}
            {e?.comments?.length > 0 ? (
              <Typography
                variant="caption"
                color={darkMode ? "white" : "GrayText"}
                fontSize={_700 ? "1.1rem" : "1rem"}
              >
                {e.comments.length} comment{" "}
              </Typography>
            ) : (
              ""
            )}
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};
export default PostTwo;