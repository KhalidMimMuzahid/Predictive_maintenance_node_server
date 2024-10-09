import mongoose, { Schema } from 'mongoose';
import { TAdvertisement, TPost, TUserPost } from './post.interface';

// Schema for TUserPost
const userPostSchema = new Schema<TUserPost>({
  title: { type: String, required: true },

  files: [
    {
      fileUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      extension: { type: String, required: true },
    },
  ],
});

// Schema for TAdvertisement
const advertisementSchema = new Schema<TAdvertisement>({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  scheduledDate: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  files: [
    {
      fileUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      extension: { type: String, required: true },
    },
  ],
});

// Schema for TPost
const postSchema = new Schema<TPost>(
  {
    location: { type: String },
    viewPrivacy: {
      type: String,
      enum: ['public', 'friends', 'only-me', 'specific-friends'],

      required: true,
    },
    commentPrivacy: {
      type: String,
      enum: ['public', 'friends', 'only-me', 'specific-friends'],
      default: 'public',
    },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    sharingStatus: {
      isShared: { type: Boolean, required: true, default: false },
      post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    },
    isSponsored: { type: Boolean, required: true, default: false },
    type: {
      type: String,
      enum: ['userPost', 'advertisement', 'shared'],
      required: true,
    },
    userPost: {
      type: userPostSchema,
      required: function () {
        return this.type === 'userPost';
      },
    },
    advertisement: {
      type: advertisementSchema,
      required: function () {
        return this.type === 'advertisement';
      },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        type: new Schema(
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            comment: { type: String, required: true },
            replays: [
              {
                type: new Schema(
                  {
                    user: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: 'User',
                      required: true,
                    },
                    comment: { type: String, required: true },
                  },
                  { timestamps: true },
                ),
              },
            ],
          },
          { timestamps: true },
        ),
      },
    ],
    shares: { type: [mongoose.Schema.Types.ObjectId], ref: 'Post' },
    seenBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Post = mongoose.model('Post', postSchema);

export default Post;
