
import prisma from "../prisma/connector.js"

import { cloudinary } from "../config/cloudinary.js"
import pkg from "formidable";
const { formidable } = pkg;



const addPost = async (req, res) => {
    try {
        const form = formidable({});

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({ msg: "Error parsing form data", error: err.message });
            }

            let mediaUrl = null;
            let publicId = null;

            if (files.media) {
                try {
                    const uploadResult = await cloudinary.uploader.upload(
                        files.media.filepath,
                        { folder: "thread_clone/posts" }
                    );

                    mediaUrl = uploadResult.secure_url;
                    publicId = uploadResult.public_id;
                } catch (uploadErr) {
                    return res.status(500).json({ msg: "Image upload failed", error: uploadErr.message });
                }
            }

            const newPost = await prisma.post.create({
                data: {
                    text: fields.text || "",
                    media: mediaUrl,
                    public_id: publicId,
                    author: {
                        connect: { id: req.user.id },
                    },
                    admin: {
                        connect: { id: req.user.id }
                    }
                },
            });

            return res.status(201).json({ msg: "Post created successfully", post: newPost });
        });
    } catch (err) {
        return res.status(500).json({ msg: "Server error", error: err.message });
    }
}


const allPost = async (req, res) => {
    try {
        const { page } = req.query
        let pageNumber = page
        if (!page || page === undefined) {
            pageNumber = 1
        }
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            skip: (pageNumber - 1) * 3,
            take: 3,
            include: {
                admin: {
                    select: { id: true, username: true, bio: true, email: true, bio: true, public_id: true }
                },
                likes: true,
                comments: true
            },
        });
        res.status(404).json({ msg: "all Post", allPost: posts })

    }
    catch (err) {
        res.status(404).json({ msg: err.message })

    }
}


const deletePost = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        if (!id) {
            return res.status(404).json({ msg: "id is required" })
        }
        const postExist = await prisma.post.findUnique({
            where: {
                id: id
            }
        })
        if (!postExist) {
            return res.status(404).json({ msg: "no such post" })
        }
        const userId = req.user.id
        const adminId = postExist.adminId
        if (userId != adminId) {
            return res.status(400).json({ msg: "You are not authorized to delete post" })
        }
        if (postExist.media) {
            await cloudinary.uploader.destroy(
                postExist.public_id, (error, result) => {
                    console.log({ error, result })
                }
            )
        }


        await prisma.post.delete({
            where: {
                id: id,
            },
        });
        return res.status(401).json({ msg: "Post delete successfully" })
    }
    catch (err) {
        return res.status(402).json({ msg: "error in delete post", err: err.message })
    }
}



const likePost = async (req, res) => {

    try {
        const id = parseInt(req.params.id)
        if (!id) {
            return res.status(404).json({ msg: "id is required" })
        }
        const post = await prisma.post.findUnique({
            where: {
                id: id
            }
        })
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        const existingLike = await prisma.like.findFirst({
            where: {
                userId: req.user.id,
                postId: id,
            },
        });

        if (existingLike) {
            await prisma.like.deleteMany({
                where: {
                    userId,
                    postId,
                },
            });
            return res.status(404).json({ msg: "Post Unliked" })

        }
        await prisma.like.create({
            data: {
                user: { connect: { id: req.user.id } },
                post: { connect: { id: parseInt(id) } },
            },
        });

        return res.status(404).json({ msg: "Post liked" })


    }
    catch (err) {
        return res.status(404).json({ err: err.message })
    }
}


const repost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);

    if (!postId) {
      return res.status(400).json({ msg: "Id is needed!" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ msg: "No such post!" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reposts: {
          where: { id: postId },
        },
      },
    });

    if (user.reposts.length > 0) {
      return res.status(400).json({ msg: "This post is already reposted!" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        reposts: {
          connect: { id: postId }
        }
      }
    });

    res.status(201).json({ msg: "Reposted!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error in repost!", err: err.message });
  }
};



const singlePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id); 

    if (!postId) {
      return res.status(400).json({ msg: "Id is required!" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        admin: {
          select: {
            id: true,
            username: true,       
            email: true,
            profilePic: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,         
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,   
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ msg: "No such post!" });
    }

    res.status(200).json({ msg: "Post Fetched!", post });
  } catch (err) {
    res.status(400).json({ msg: "Error in singlePost!", err: err.message });
  }
};





export { addPost, allPost, deletePost, likePost,repost,singlePost }