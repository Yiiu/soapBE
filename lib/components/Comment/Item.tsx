import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import { rem } from 'polished';
import { css } from 'styled-components';
import day from 'dayjs';

import { CommentEntity } from '@lib/common/interfaces/comment';
import { UserPopper } from '@lib/containers/Picture/components/UserPopper';
import { UserEntity } from '@lib/common/interfaces/user';
import { useAccountStore } from '@lib/stores/hooks';
import { A } from '../A';
import { Avatar, EmojiText } from '..';
import { Popover } from '../Popover';
import { CommentEditor } from './Editor';
import {
  ContentBox, InfoBox, ItemBox, MainBox, UserName, ReplyLabel, ContentItem, ConfirmText, UserLabel, ChildComment, Dot, MoreChildComment, MoreChildCommentBtn,
} from './styles/list';
import { CommentList } from './List';

interface ICommentItem {
  visibleChild?: boolean;
  parent?: CommentEntity;
  author: UserEntity;
  comment: CommentEntity;
  onConfirm: (value: string, commentId?: string) => Promise<void>;
  openModal?: (data: CommentEntity) => void;
}

export const CommentItem: React.FC<ICommentItem> = observer(({
  visibleChild = true,
  parent,
  author,
  comment,
  onConfirm,
  openModal,
}) => {
  const { isLogin } = useAccountStore();
  const [isComment, setComment] = useState(false);
  const [visibleComment, setVisibleComment] = useState(true);
  const {
    user, id, content, createTime, childComments, replyUser, replyComment,
  } = comment;
  const openComment = useCallback(() => {
    setComment(!isComment);
  }, [isComment]);
  const handleChildComment = useCallback(() => {
    setVisibleComment(!visibleComment);
  }, [visibleComment]);
  const addComment = useCallback(async (commentContent: string) => {
    await onConfirm(commentContent, comment.id);
    setComment(false);
  }, [comment.id, onConfirm]);
  const openItemModal = useCallback(() => {
    if (openModal) {
      openModal(comment);
    }
  }, [comment, openModal]);
  return (
    <ItemBox id={`comment-${id}`}>
      <A
        route={`/@${user.username}`}
      >
        <UserPopper username={user.username}>
          <Avatar src={user.avatar} />
        </UserPopper>
      </A>
      <MainBox>
        <ContentBox>
          <ContentItem>
            <A
              route={`/@${user.username}`}
              css={css`text-decoration: none;display: inline-block;` as any}
            >
              <UserName>
                <EmojiText
                  text={user.fullName}
                />
              </UserName>
            </A>
            {
              author.username === user.username && (
                <UserLabel>(作者)</UserLabel>
              )
            }
            {
              !!(replyComment && replyUser) && !!(parent?.id !== comment.replyComment.id) && (
                <ReplyLabel>
                  <span>回复 </span>
                  <UserPopper username={user.username}>
                    <A
                      route={`/@${user.username}`}
                      css={css`text-decoration: none;display: inline-block;` as any}
                    >
                      <span>
                        <EmojiText
                          text={user.fullName}
                        />
                      </span>
                    </A>
                  </UserPopper>
                  <span>：</span>
                </ReplyLabel>
              )
            }
          </ContentItem>
          <div>
            <EmojiText
              text={content}
            />
          </div>
        </ContentBox>
        <InfoBox>
          <Popover
            openDelay={100}
            trigger="hover"
            placement="top"
            theme="dark"
            content={<span>{day(createTime).format('YYYY-MM-DD HH:mm:ss')}</span>}
          >
            <p>{day(createTime).fromNow()}</p>
          </Popover>
          {
            childComments?.length > 0 && visibleChild && (
              <>
                <Dot>·</Dot>
                <ConfirmText
                  onClick={handleChildComment}
                >
                  {visibleComment ? '收起回复' : `展开 ${comment.subCount} 条回复`}
                </ConfirmText>
              </>
            )
          }
          {
            isLogin && (
              <>
                <Dot>·</Dot>
                <ConfirmText
                  onClick={openComment}
                >
                回复
                </ConfirmText>
              </>
            )
          }
        </InfoBox>
        {
          isComment && (
            <div css={css`margin-top: ${rem(12)};`}>
              <CommentEditor
                child
                onConfirm={addComment}
                placeholder={`回复@${user.fullName}：`}
                onClose={() => setComment(false)}
              />
            </div>
          )
        }
        {
          childComments?.length > 0 && visibleComment && visibleChild && (
            <ChildComment>
              <CommentList
                openModal={openModal}
                parent={comment}
                author={author}
                onConfirm={onConfirm}
                comment={childComments}
              />
              {
                openModal && comment.subCount > 3 && (
                  <MoreChildComment>
                    <MoreChildCommentBtn onClick={openItemModal}>查看所有评论</MoreChildCommentBtn>
                  </MoreChildComment>
                )
              }
            </ChildComment>
          )
        }
      </MainBox>
    </ItemBox>
  );
});