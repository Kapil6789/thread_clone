import prisma from "../prisma/connector.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { cloudinary } from "../config/cloudinary.js"
import pkg from "formidable";
const { formidable } = pkg;

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_key";

// normalized cookie options for consistency
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

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
    // ensure email is not already registered (use findFirst to avoid requiring unique constraint)
    const emailExist = await prisma.user.findFirst({ where: { email } });
    if (emailExist) {
      return res.status(400).json({ msg: "Email already registered! Please login" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "30d" });

    // use normalized cookie options
    res.cookie("thread_token", token, cookieOptions);
    res.status(200).json({
      msg: "Signed up successfully",
      // optionally return token if client wants to use Authorization header
      token,
      me: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error in signup", err: err.message });
  }
};

const loginUser = async (req, res, next) => {
  try {
    // accept username or email as identifier
    const identifier = req.body?.username || req.body?.email || req.body?.identifier;
    const { password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ msg: "credentials are required" });
    }

    const userExist = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      }
    });
    if (!userExist) {
      return res.status(400).json({ msg: "Please signup first" });
    }

    const passwordMatched = await bcrypt.compare(String(password), userExist.password);
    if (!passwordMatched) {
      return res.status(401).json({ msg: "invalid credentials" });
    }

    const accessToken = jwt.sign({ id: userExist.id }, JWT_SECRET, { expiresIn: "30d" });

    res.cookie("thread_token", accessToken, cookieOptions);
    res.status(200).json({
      msg: "User logged in successfully!",
      token: accessToken,
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
  res
    .cookie("thread_token", "", { ...cookieOptions, maxAge: 0 })
    .status(200)
    .json({ message: "Logged out successfully" });
}

const userDetails = async (req, res, next) => {
  try {
    // Fix: Replace idParam with req.params.id
    const id = parseInt(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ msg: "Invalid user ID" });
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
        followers: {
          select: {
            id: true
          }
        }
      },
    });

    res.status(200).json({ msg: "Search completed", users })

  }
  catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ msg: "Error in search user" })
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