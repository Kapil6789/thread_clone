import prisma from "../prisma/connector.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { cloudinary } from "../config/cloudinary.js"
import pkg from "formidable";
const { formidable } = pkg;



const signUpUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "username, password, and email are required" });
    }

    const userExist = await prisma.user.findUnique({ where: { username } });
    if (userExist) {
      return res.status(400).json({ msg: "User already registered! Please login" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.cookie("thread_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    res.status(200).json({
      msg: "Signed in successfully",
      me: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error in signin", err: err.message });
  }
};



const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: "credentials are required" });
    }
    const userExist = await prisma.user.findUnique({
      where: { username }
    });
    if (!userExist) {
      return res.status(400).json({ msg: "Please signin first" });
    }
    const passwordMatched = await bcrypt.compare(String(password), userExist.password);
    if (!passwordMatched) {
      return res.status(411).json({ msg: "invalid credentials" });
    }
    const accessToken = jwt.sign({ id: userExist.id }, process.env.JWT_SECRET, { expiresIn: "3d" });
    if (!accessToken) {
      return res.status(400).json({ msg: "error in generating token" });
    }
    res.cookie("thread_token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      partitioned: true
    });
   res.status(200).json({
      msg: "User logged in successfully!",
      user: {
        id: userExist.id,
        username: userExist.username,
        email: userExist.email,
        profilePic: userExist.profilePic,
      }
    });  
  }
  catch(err){
    res.status(500).json({msg:err.message})
  }
}

const logout = async (req, res, next) => {
  res.status(200).cookie("thread_token", "", {
    maxAge: 0,
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  }).json({
    message: "Logged out successfully"
  })
}

const userDetails = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ msg: "User ID is required" });
    }


    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,

        // Followers
        followers: {
          include: {
            follower: {
              select: {
                id: true,
                username: true,
                profilePic: true
              }
            }
          }
        },

        // Replies by user
        replies: {
          include: {
            post: {
              select: { id: true, text: true }
            },
            author: {
              select: {
                id: true,
                username: true
              }
            },
            likes: {
              select: {
                user: {
                  select: { id: true, username: true }
                }
              }
            }
          }
        },

        // Threads authored by user
        threads: {
          include: {
            likes: {
              select: {
                user: {
                  select: { id: true, username: true }
                }
              }
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true
                  }
                },
                likes: {
                  select: {
                    user: {
                      select: { id: true, username: true }
                    }
                  }
                }
              }
            },
            admin: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },

        // Reposts by user
        reposts: {
          include: {
            post: {
              include: {
                likes: {
                  select: {
                    user: {
                      select: { id: true, username: true }
                    }
                  }
                },
                comments: {
                  include: {
                    author: {
                      select: { id: true, username: true }
                    },
                    likes: {
                      select: {
                        user: {
                          select: { id: true, username: true }
                        }
                      }
                    }
                  }
                },
                admin: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ msg: "User details fetched", user });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error fetching user details", error: error.message });
  }
};


const followUser = async (req, res) => {
  try {
    const userIdToFollow = parseInt(req.params.id);
    const followerId = req.user?.id;



    if (!followerId) return res.status(404).json({ msg: "Follower not found" });



    // Fetch user to follow with followers included
    const userToFollow = await prisma.user.findUnique({ where: { id: userIdToFollow } });
    if (!userToFollow) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if already following
    const existingFollow = await prisma.followers.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userIdToFollow,
        },
      },
    });


    if (existingFollow) {
      await prisma.followers.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userIdToFollow,
          },
        },
      });
      return res.status(200).json({ msg: `Unfollowed ${userToFollow.username}` });
    }

    // 4. Create follow
    await prisma.followers.create({
      data: {
        followerId,
        followingId: userIdToFollow,
      },
    });

    return res.status(200).json({ msg: `You are now following ${userToFollow.username}` });

  } catch (error) {
    console.error("Follow user error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const userExist = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!userExist) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const form = formidable({});

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    if (fields.text) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { bio: fields.text },
      });
    }

    if (files.media) {
      // Delete old profile image from Cloudinary
      if (userExist.public_id) {
        await cloudinary.uploader.destroy(userExist.public_id);
      }

      // Upload new image
      const uploadedImage = await cloudinary.uploader.upload(files.media.filepath, {
        folder: 'Thread_clone/Profiles',
      });


      if (!uploadedImage?.secure_url) {
        return res.status(500).json({ msg: "Image upload failed" });
      }

      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          profilePic: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        },
      });
    }

    res.status(200).json({ msg: "Profile updated successfully" });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
};



const searchUser = async (req, res) => {
  try {
    const { query } = req.params
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePic: true,
        bio: true,
      },
    });

    res.status(200).json({ msg: "Search !", users })

  }
  catch (err) {
    res.status(401).json({ msg: "error in search user" })
  }
}



const myInfo = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized: User ID missing" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        threads: true,
        posts: true,
        comments: true,
        followers: true,
        following: true,
        likes: true,
        replies: true,
        reposts: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ me: user });
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ msg: "Error in fetching info" });
  }
};




export { signUpUser, loginUser, userDetails, followUser, logout, updateProfile, searchUser, myInfo }