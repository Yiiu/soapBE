import React from 'react';

import { PictureEntity } from '@pages/common/interfaces/picture';
import { getScrollHeight, getScrollTop, getWindowHeight, isSafari, server } from '@pages/common/utils';
import { listParse } from '@pages/common/utils/waterfall';
import { Loading } from '@pages/components/Loading';
import { NoSSR } from '@pages/components/SSR';
import { debounce } from 'lodash';
import { observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import Col from './Col';
import { Footer, Wapper } from './styles';

import { defaultBreakpoints } from 'styled-media-query';

interface IProps {
  /**
   * picture列表数据
   *
   * @type {PictureEntity[]}
   * @memberof IProps
   */
  data: PictureEntity[];

  like: (data: PictureEntity) => void;

  onPage?: () => Promise<void>;

  noMore: boolean;
}

const mediaArr = [
  {
    media: `(min-width: ${defaultBreakpoints.large})`,
    col: 4,
  },
  {
    media: `(min-width: ${defaultBreakpoints.medium}) and (max-width: ${defaultBreakpoints.large})`,
    col: 3,
  },
  {
    media: `(min-width: ${defaultBreakpoints.small}) and (max-width: ${defaultBreakpoints.medium})`,
    col: 2,
  },
  {
    media: `(max-width: ${defaultBreakpoints.small})`,
    col: 1,
  },
];

@observer
export class PictureList extends React.Component<IProps> {
  public static defaultProps: Partial<IProps> = {
    noMore: false,
  };
  @observable public col = 4;
  @observable public colArr = [4, 3, 2, 1];
  // 这是给服务端渲染用的
  @observable public colList: PictureEntity[][][] = [];

  // 浏览器时使用这个数据
  @observable public pictureList: PictureEntity[][] = [];

  public _pageLock = false;

  public _removeEvent = false;

  public eventScroll = debounce(async () => {
    const offset = getScrollHeight() - (getScrollTop() + getWindowHeight());
    if (offset <= 300 && !this._pageLock && !this.props.noMore) {
      if (this.props.onPage) {
        this._pageLock = true;
        await this.props.onPage();
        setTimeout(() => {
          this._pageLock = false;
        }, 400);
      }
    }
  }, 50);

  public onresize = debounce(() => {
    for (const info of mediaArr) {
      const mediaData = window.matchMedia(info.media);
      if (mediaData.matches) {
        this.col = info.col;
      }
    }
  }, 50);

  constructor(props: IProps) {
    super(props);
    this.formatList(props.data);
    reaction(
      () => this.props.data,
      () => {
        this.pictureFormat();
      },
    );
    reaction(
      () => this.props.noMore,
      (noMore) => {
        if (!server) {
          if (noMore) {
            window.removeEventListener('scroll', this.eventScroll);
            this._removeEvent = true;
          } else {
            if (this._removeEvent) {
              window.addEventListener('scroll', this.eventScroll);
              this._removeEvent = false;
            }
          }
        }
      },
    );
    reaction(
      () => this.col,
      (col) => {
        this.pictureFormat(col);
      },
    );
  }
  public componentWillMount() {
    if (!server) {
      if (!this.props.noMore) {
        window.addEventListener('scroll', this.eventScroll);
      }
      this.media();
      this.pictureFormat();
    }
  }
  public componentWillUnmount() {
    window.removeEventListener('resize', this.onresize);
    this._removeEvent = true;
  }
  public pictureFormat = (col = this.col) => {
    this.pictureList = listParse(this.props.data, col);
  }
  public media = () => {
    for (const info of mediaArr) {
      const mediaData = window.matchMedia(info.media);
      if (isSafari) {
        window.addEventListener('resize', this.onresize);
        // (mediaData as any).addEventListener((data: any) => {
        //   if (data.matches) {
        //     this.col = info.col;
        //   }
        // });
      } else {
        mediaData.addEventListener('change', (data) => {
          if (data.matches) {
            this.col = info.col;
          }
        });
      }
      if (mediaData.matches) {
        this.col = info.col;
      }
    }
  }
  public formatList = (data: PictureEntity[]) => {
    this.colList = this.colArr.map(col => listParse(data, col));
  }
  public render() {
    const { noMore } = this.props;
    return (
      <Wapper>
        <NoSSR server={false}>
          {
            this.colList.map((mainCol, i) => (
              <Col ssr={true} col={this.colArr[i]} key={this.colArr[i]} list={mainCol} />
            ))
          }
        </NoSSR>
        <NoSSR>
          <Col like={this.props.like} col={this.col} list={this.pictureList} />
        </NoSSR>
        <Footer>
          {
            noMore ? (
              <span>没有更多内容啦</span>
            ) : (
              <Loading size={8} />
            )
          }
        </Footer>
      </Wapper>
    );
  }
}
