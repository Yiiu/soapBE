import moment from 'moment';
import React, { useCallback, useState } from 'react';

import { PictureEntity } from '@lib/common/interfaces/picture';
import { connect } from '@lib/common/utils/store';
import { EXIFModal } from '@lib/components/EXIFModal';
import { LikeButton, IconButton } from '@lib/components/Button';
import { Popover } from '@lib/components/Popover';
import { Clock, Bookmark, Info } from '@lib/icon';
import { AccountStore } from '@lib/stores/AccountStore';
import { IMyMobxStore } from '@lib/stores/init';
import { ThemeStore } from '@lib/stores/ThemeStore';
import {
  BaseInfoHandleBox, BaseInfoItem, PictureBaseInfo,
} from '@lib/styles/views/picture';
import { AddPictureCollectonModal } from '@lib/containers/Collection/AddPictureCollectonModal';

interface IProps {
  info: PictureEntity;
  accountStore?: AccountStore;
  themeStore?: ThemeStore;
  onLike: () => Promise<void>;
}

export const PictureInfo = connect<React.FC<IProps>>((stores: IMyMobxStore) => ({
  accountStore: stores.accountStore,
  themeStore: stores.themeStore,
}))(({
  info,
  accountStore,
  themeStore,
  onLike,
}) => {
  const [EXIFVisible, setEXIFVisible] = useState(false);
  const [CollectionVisible, setCollectionVisible] = useState(false);
  const { isLogin } = accountStore!;
  const { themeData } = themeStore!;

  const closeEXIF = useCallback(() => {
    setEXIFVisible(false);
  }, []);
  const closeCollection = useCallback(() => {
    setCollectionVisible(false);
  }, []);
  const openEXIF = useCallback(() => {
    setEXIFVisible(true);
  }, []);
  const openCollection = useCallback(() => {
    setCollectionVisible(true);
  }, []);
  console.log(info);
  return (
    <PictureBaseInfo>
      <div>
        <Popover
          openDelay={100}
          trigger="hover"
          placement="top"
          theme="dark"
          content={<span>{moment(info.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>}
        >
          <BaseInfoItem>
            <Clock size={20} />
            <p>{moment(info.createTime).from()}</p>
          </BaseInfoItem>
        </Popover>
      </div>
      <BaseInfoHandleBox
        flow="column"
        columns="auto"
        justifyContent="right"
      >
        <IconButton popover="图片信息" onClick={openEXIF}>
          <Info
            color={themeData.colors.secondary}
          />
        </IconButton>
        {
          isLogin
          && (
            <LikeButton
              color={themeData.colors.secondary}
              isLike={info.isLike}
              size={22}
              onLike={onLike}
            />
          )
        }
        {
          isLogin
          && (
            <IconButton popover="添加收藏" onClick={openCollection}>
              <Bookmark
                color={themeData.colors.secondary}
              />
            </IconButton>
          )
        }
      </BaseInfoHandleBox>
      <EXIFModal
        visible={EXIFVisible}
        onClose={closeEXIF}
        picture={info}
      />
      <AddPictureCollectonModal
        picture={info}
        visible={CollectionVisible}
        onClose={closeCollection}
        currentCollections={info.currentCollections || []}
      />
    </PictureBaseInfo>
  );
});
