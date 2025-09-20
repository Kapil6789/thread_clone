import {
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { IoIosMore } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { useSelector } from "react-redux";
import {useDeleteCommentMutation,useSinglePostQuery,useAddCommentMutation} from "../../../redux/service.js";
import { Bounce, toast } from "react-toastify";

const Comments = ({ e, postId, showAddComment = false, onRefresh }) => {
  const { darkMode, myInfo } = useSelector((state) => state.service);

  const [anchorEl, setAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentText, setCommentText] = useState("");

  const _700 = useMediaQuery("(min-width:700px)");

  const [deleteComment, deleteCommentData] = useDeleteCommentMutation();
  const [addComment, addCommentData] = useAddCommentMutation();
  
 

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteComment = async () => {
    try {
      const info = {
        postId,
        id: e?.id || e?._id,
      };
      await deleteComment(info);
      handleClose();
    
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };

  const handleAddComment = async () => {
    console.log("DEBUG - handleAddComment called with:", { 
      commentText: commentText.trim(), 
      postId: postId,
    });
    
    if (!commentText.trim() || !postId || postId === 'undefined') {
      console.log("Missing comment text or invalid postId:", { commentText, postId });
      return;
    }
    
    console.log("Adding comment:", { postId, text: commentText }); // Debug log
    
    try {
      // Structure the data to match the API endpoint expectation
      // The mutation should use postId as a URL parameter, not in the body
      const result = await addComment({
        postId: postId, // This should be used as URL parameter
        body: { text: commentText } // This should be the request body
      });
      
      console.log("Comment result:", result); // Debug log
      
      setCommentText("");
     
    } catch (error) {
      console.error("Add comment error:", error);
    }
  };

  const checkIsAdmin = () => {
    if (e && myInfo) {
      const authorId = e.author?.id || e.author?._id;
      const myId = myInfo.id || myInfo._id;
      setIsAdmin(authorId === myId);
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkIsAdmin();
  }, [e, myInfo]);

  useEffect(() => {
    if (deleteCommentData.isSuccess) {
      toast.success(deleteCommentData.data.msg, {
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
    if (deleteCommentData.isError) {
      toast.error(deleteCommentData.error.data.msg, {
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
  }, [deleteCommentData.isSuccess, deleteCommentData.isError]);

  useEffect(() => {
    if (addCommentData.isSuccess) {
      toast.success("Comment added successfully!", {
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
    if (addCommentData.isError) {
      toast.error(addCommentData.error?.data?.msg || "Failed to add comment", {
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
  }, [addCommentData.isSuccess, addCommentData.isError]);



  return (
    <div>
      {/* Existing comment display */}
      {e && (
        <Stack
          flexDirection={"row"}
          justifyContent={"space-between"}
          px={2}
          pb={4}
          borderBottom={"1px solid gray"}
          mx={"auto"}
          width={"90%"}
        >
          <Stack flexDirection={"row"} gap={_700 ? 2 : 1}>
            <Avatar
              src={e?.author?.profilePic || ""}
              alt={e?.author?.userName || e?.author?.username || ""}
            />
            <Stack flexDirection={"column"}>
              <Typography variant="h6" fontWeight={"bold"} fontSize={"0.9rem"}>
                {e?.author?.userName || e?.author?.username || ""}
              </Typography>
              <Typography variant="subtitle2" fontSize={"0.9rem"}>
                {e?.text || ""}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            flexDirection={"row"}
            gap={1}
            alignItems={"center"}
            color={darkMode ? "white" : "GrayText"}
            fontSize={"0.9rem"}
          >
            <p>24min</p>
            {isAdmin && (
              <IconButton
                size="small"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ 
                  color: darkMode ? "white" : "GrayText",
                  padding: 0.5,
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }}
              >
                <IoIosMore size={_700 ? 28 : 20} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      )}

      {/* Add comment input - show when showAddComment prop is true and postId is valid */}
      {showAddComment && postId && postId !== 'undefined' && postId !== undefined && postId !== null && (
        <Box px={2} py={2} width={"90%"} mx={"auto"}>
          <Stack flexDirection={"row"} gap={2} alignItems={"center"}>
            <Avatar
              src={myInfo?.profilePic || ""}
              alt={myInfo?.userName || myInfo?.username || ""}
              sx={{ width: 32, height: 32 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              size="small"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  console.log("Enter pressed, postId:", postId); // Debug log
                  handleAddComment();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                }
              }}
            />
            <IconButton 
              onClick={handleAddComment}
              disabled={!commentText.trim() || addCommentData.isLoading || !postId || postId === 'undefined'}
              color="primary"
              sx={{ 
                bgcolor: (commentText.trim() && postId && postId !== 'undefined') ? 'primary.main' : 'grey.300',
                color: (commentText.trim() && postId && postId !== 'undefined') ? 'white' : 'grey.600',
                '&:hover': {
                  bgcolor: (commentText.trim() && postId && postId !== 'undefined') ? 'primary.dark' : 'grey.400',
                }
              }}
            >
              <IoSend />
            </IconButton>
          </Stack>
        </Box>
      )}

      {/* Delete Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleDeleteComment}>Delete</MenuItem>
      </Menu>
    </div>
  );
};
export default Comments;