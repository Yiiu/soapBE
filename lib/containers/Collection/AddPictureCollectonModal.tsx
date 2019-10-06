/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';

import { Modal, EmojiText, Empty } from '@lib/components';
import { PictureEntity } from '@lib/common/interfaces/picture';
import { rgba, rem } from 'polished';
import { getPictureUrl } from '@lib/common/utils/image';
import styled from 'styled-components';
import { CollectionEntity, ICollectionListRequest } from '@lib/common/interfaces/collection';
import { Check, Minus, PlusCircle } from '@lib/icon';
import { removePictureCollection, addPictureCollection } from '@lib/services/collection';
import { Loading } from '@lib/components/Loading';
import { Image } from '@lib/components/Image';
import { theme, activte } from '@lib/common/utils/themes';
import { useTranslation } from '@lib/i18n/useTranslation';

import { useStores, useAccountStore } from '@lib/stores/hooks';
import { useTheme } from '@lib/common/utils/themes/useTheme';
import { observer } from 'mobx-react';
import { UserCollectionsByName } from '@lib/schemas/query';
import { useQuery } from '@apollo/react-hooks';
import { AddCollectionModal } from './AddCollectionModal';

interface IProps {
  visible: boolean;
  picture: PictureEntity;
  onClose: () => void;
  currentCollections: CollectionEntity[];
}

const Title = styled.h2`
  font-size: ${_ => rem(theme('fontSizes[3]')(_))};
  padding: ${rem('24px')};
`;

const CheckIcon = styled(Check)`
  transition: .1s opacity ease;
`;
const MinusIcon = styled(Minus)`
  transition: .1s opacity ease;
`;

const CollectionItemBox = styled.button`
  cursor: pointer;
  outline: none;
  display: block;
  width: 100%;
  height: ${rem('80px')};
  border-radius: 5px;
  background-color: #f5f5f5;
  overflow: hidden;
  border: none;
  padding: 0;
  background-color: transparent;
  position: relative;
  text-align: inherit;
  transition: transform 0.1s;
  ${activte()}
`;

const CollectionBox = styled.div`
  padding: ${rem(24)};
  padding-top: 0;
  display: grid;
  grid-gap: 14px;
`;

const CollectionItemCover = styled(Image)`
  font-family: "object-fit:cover";
  -o-object-fit: cover;
  object-fit: cover;
  width: 100%;
  height: 100%;
`;

const ItemInfoBox = styled.div<{isCollected: boolean; isPreview: boolean}>`
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: ${_ => rgba(theme('styles.collection.addPicture.background')(_), _.isPreview ? 0.2 : 0.8)};
  transition: all .15s ease-in-out;
  padding: 17px 20px;
  color: ${theme('styles.collection.addPicture.color')};
  border-radius: 4px;
  & ${CheckIcon} {
    opacity: 0;
  }
  & ${MinusIcon} {
    opacity: 0;
  }
  &:hover {
    & ${CheckIcon} {
      opacity: 1;
    }
  }
  ${
  _ => _.isCollected && `
      border: 2px solid ${_.theme.colors.baseGreen};
      background: linear-gradient(
        45deg,
        ${rgba(theme('styles.collection.addPicture.background')(_), 0.3)},
        ${_.theme.colors.baseGreen}
      );
      & ${CheckIcon} {
        opacity: 1;
      }
      &:hover {
        & ${MinusIcon} {
          opacity: 1;
        }
        & ${CheckIcon} {
          opacity: 0;
        }
      }
    `}
`;

const ItemInfoTitle = styled.p`
  color: ${theme('styles.collection.addPicture.color')};
  font-size: ${_ => rem(theme('fontSizes[3]')(_))};
  font-weight: 700;
  margin-bottom: ${rem(6)};
  display: flex;
  align-items: center;
`;

const ItemInfoCount = styled.p`
  font-size: ${_ => rem(_.theme.fontSizes[0])};
`;

const ItemHandleIcon = styled.div`
  position: relative;
  & svg:first-child {
    position: absolute;
  }
`;

export const AddPictureCollectonModal: React.FC<IProps> = observer(({
  visible,
  picture,
  onClose,
  currentCollections,
}) => {
  const { t } = useTranslation();
  const { userInfo } = useAccountStore();
  const { key, id } = picture;
  const { appStore } = useStores();
  const { addCollection } = appStore;
  const { colors } = useTheme();
  const [addCollectionVisible, setAddCollectionVisible] = useState(false);
  const [loadingObj, setLoading] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<Map<string, CollectionEntity>>(new Map());
  const { data: req } = useQuery<{userCollectionsByName: ICollectionListRequest}>(UserCollectionsByName, {
    variables: {
      username: userInfo!.username,
    },
  });
  // eslint-disable-next-line max-len
  const background = `linear-gradient(${rgba(colors.gray, 0.8)}, ${colors.gray} 200px), url("${getPictureUrl(key, 'blur')}")`;
  useEffect(() => () => setAddCollectionVisible(false), []);
  useEffect(() => {
    if (!visible) {
      setAddCollectionVisible(false);
    } else {
      // setTimeout(() => {
      //   getCollection();
      // }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => {
    setCurrent(
      new Map(currentCollections.map(collection => [collection.id, collection])),
    );
  }, [currentCollections]);
  useEffect(() => {
    if (req && req.userCollectionsByName && req.userCollectionsByName.data) {
      const obj: Record<string, boolean> = {};
      req.userCollectionsByName.data.forEach(collection => obj[collection.id] = false);
      setLoading(obj);
    }
  }, [req]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onCollected = async (collection: CollectionEntity, isCollected: boolean) => {
    if (loadingObj[collection.id]) {
      return;
    }
    setLoading(ld => ({
      ...ld,
      [collection.id]: true,
    }));
    try {
      if (isCollected) {
        await removePictureCollection(collection.id, id);
        current.delete(collection.id);
        setCurrent(current);
      } else {
        await addPictureCollection(collection.id, id);
        setCurrent(current.set(collection.id, collection));
      }
    } finally {
      setLoading(ld => ({
        ...ld,
        [collection.id]: false,
      }));
    }
  };
  const onAddCollectionOk = (data: CollectionEntity) => {
    addCollection(data);
    setAddCollectionVisible(false);
  };
  let content = [<Empty key="loading" loading={!req} />];
  if (req && req.userCollectionsByName) {
    content = req.userCollectionsByName.data.map((collection) => {
      const isCollected = current.has(collection.id);
      const isLoading = loadingObj[collection.id];
      const preview = collection.preview.slice();
      return (
        <CollectionItemBox
          key={collection.id}
          onClick={() => !isLoading && onCollected(collection, isCollected)}
        >
          {
            preview[0] && (
              <CollectionItemCover src={getPictureUrl(preview[0].key, 'small')} />
            )
          }
          <ItemInfoBox isCollected={isCollected} isPreview={!!preview[0]}>
            <div>
              <ItemInfoTitle>
                <EmojiText
                  text={collection.name}
                />
              </ItemInfoTitle>
              <ItemInfoCount>
                <span>{t('img_count', collection.pictureCount.toString())}</span>
              </ItemInfoCount>
            </div>
            <ItemHandleIcon>
              {
                isLoading
                  ? <Loading size={6} color="#fff" />
                  : (
                    <>
                      <CheckIcon />
                      <MinusIcon />
                    </>
                  )
              }
            </ItemHandleIcon>
          </ItemInfoBox>
        </CollectionItemBox>
      );
    });
  }
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      boxStyle={{ backgroundImage: background, padding: 0, maxWidth: rem(500) }}
    >
      <Title>{t('collection_picture.title')}</Title>
      <CollectionBox>
        <CollectionItemBox
          onClick={() => setAddCollectionVisible(true)}
        >
          <ItemInfoBox isCollected={false} isPreview={false}>
            <div>
              <ItemInfoTitle style={{ marginBottom: 0 }}>
                <PlusCircle style={{ marginRight: '12px' }} />
                <span>{t('collection_picture.add')}</span>
              </ItemInfoTitle>
            </div>
          </ItemInfoBox>
        </CollectionItemBox>
        {content}
      </CollectionBox>
      <AddCollectionModal
        onClose={() => setAddCollectionVisible(false)}
        visible={addCollectionVisible}
        onOk={onAddCollectionOk}
      />
    </Modal>
  );
});
