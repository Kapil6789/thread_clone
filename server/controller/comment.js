import prisma from "../prisma/connector.js"


const addComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId); // Changed from id to postId
    const { text } = req.body;

    if (!postId) {
      return res.status(400).json({ msg: "Post ID is required" });
    }
    if (!text) {
      return res.status(400).json({ msg: "No comment text provided!" });
    }

    const postExist = await prisma.post.findUnique({
      where: { id: postId } // Use postId here
    });

    if (!postExist) {
      return res.status(404).json({ msg: "No such post" });
    }

    // Create the comment (connect to post and author)
    const newComment = await prisma.comment.create({
      data: {
        text,
        author: {
          connect: { id: req.user.id }
        },
        post: {
          connect: { id: postId } // Use postId here
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePic: true
          }
        }
      }
    });

    res.status(201).json({ msg: "Commented!", comment: newComment });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "error in adding comments",
      err: err.message
    });
  }
};


const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const postId = parseInt(req.params.postId);

    if (isNaN(commentId) || isNaN(postId)) {
      return res.status(400).json({ msg: "Invalid ID format" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    if (comment.postId !== postId) {
      return res.status(400).json({ msg: "Comment does not belong to this post" });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return res.status(200).json({ msg: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};



export { addComments, deleteComment }