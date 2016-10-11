import React from 'react';
import Sound from 'react-sound';
import { ContextMenu, Item, Separator, menuProvider } from 'react-contexify';

import Navbar from '../components/navbar.component';
import NowPlayingWithMenu from '../components/nowplaying.component';
import NowPlayingContainer from '../containers/nowplaying.container';
import Player from '../components/player.component';
import SongList from '../components/songlist.component';
import SongListContainer from '../containers/songlist.container';
import Tools from '../components/tools.component';
import ToolsContainer from '../containers/tools.container';


class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songList: [],
      playQueue: [],
      playStatus: Sound.status.STOPPED,
      songListLoading: false,
      nowPlayingLoading: false,
      nowPlayingCurrentSong: 0,
      songProgress: 0.0
    };
  }

  fetchSongStreamUrl(song, callback){
    if (song.streamurl==""){
      var youtubedl = window.require('youtube-dl');
      var url = 'http://www.youtube.com/watch?v='+song.id;
      youtubedl.getInfo(url, ["--get-url", "--format=bestaudio"], function(err, info) {
        if (err) throw err;

        song.streamurl=info.url;
        callback();
      });
    }
  }

  songListChangeCallback(songs){
    this.setState({songList: songs, songListLoading: false});
  }

  songSearchStartCallback(){
    this.setState({songListLoading: true});
  }

  togglePlayCallback(){
    var _this=this;

    if(this.state.playStatus === Sound.status.PLAYING){
      this.setState({playStatus: Sound.status.PAUSED});
    } else {
      this.setState({playStatus: Sound.status.PLAYING});
      if(this.state.playQueue[this.state.nowPlayingCurrentSong].streamurl==""){
        this.setState({nowPlayingLoading: true});
        this.fetchSongStreamUrl(this.state.playQueue[this.state.nowPlayingCurrentSong],
                                function(){
                                  _this.setState({nowPlayingLoading: false});
                                });
      }
    }
  }

  playerChangeSong(offset){
    var _this=this;

    if(this.state.playQueue[this.state.nowPlayingCurrentSong+offset].streamurl==""){
      this.setState({nowPlayingLoading: true});
      this.fetchSongStreamUrl(this.state.playQueue[this.state.nowPlayingCurrentSong+offset],
                              function(){
                                _this.setState({nowPlayingLoading: false});
                              });
      this.setState({nowPlayingCurrentSong: _this.state.nowPlayingCurrentSong+offset});
    }
  }

  playerNextCallback(){
    this.playerChangeSong(1);
  }

  playerPrevCallback(){
    this.playerChangeSong(-1);
  }

  addToQueue(song, event){
    var pq = this.state.playQueue;
    pq.push(song);
    this.setState({playQueue: pq});
  }

  handleSongPlaying(audio){
    this.setState({songProgress: audio.position/audio.duration});
  }

  handleSongFinished(){
    var _this=this;
    if (this.state.nowPlayingCurrentSong<this.state.playQueue.length-1){
      this.setState({nowPlayingCurrentSong: this.state.nowPlayingCurrentSong+1});
    }

    if (this.state.playQueue.length == 0){
      console.log("queue empty");
      this.setState({playStatus: Sound.status.STOPPED});
    }

    if(this.state.playQueue[this.state.nowPlayingCurrentSong].streamurl==""){
      _this.setState({nowPlayingLoading: true});
      this.fetchSongStreamUrl(this.state.playQueue[this.state.nowPlayingCurrentSong],
                              function(){
                                _this.setState({nowPlayingLoading: false});
                              });
    }
  }

  clearQueue(){
    this.setState({playQueue: [], nowPlayingCurrentSong: 0});
  }

  renderSound(){
    if (this.state.playQueue.length>0){
      return (<Sound
       url={this.state.playQueue[this.state.nowPlayingCurrentSong].streamurl}
       playStatus={this.state.playStatus}
       onPlaying={this.handleSongPlaying.bind(this)}
       onFinishedPlaying={this.handleSongFinished.bind(this)}
              />);
    } else {
      return [];
    }
  }

  renderTools(){
    if(this.state.playQueue.length > 0){
      return(
        <ToolsContainer
           albumart={this.state.playQueue[this.state.nowPlayingCurrentSong].thumbnail}
           title={this.state.playQueue[this.state.nowPlayingCurrentSong].title}
           />
      );
    } else {
      return (
        <ToolsContainer />
      );
    }
  }

  render () {
    return (
        <div>

        <Navbar />

        {this.renderTools()}

        <SongListContainer
      appContainer={this}
      addToQueue={this.addToQueue}
      songList={this.state.songList}
      songListLoading={this.state.songListLoading}
      songSearchStartCallback={this.songSearchStartCallback.bind(this)}
      songListChangeCallback={this.songListChangeCallback.bind(this)}
        />

        <NowPlayingContainer
      queue={this.state.playQueue}
      loading={this.state.nowPlayingLoading}
      currentSong={this.state.nowPlayingCurrentSong}
      clearQueueCallback={this.clearQueue.bind(this)}
        />


        {this.renderSound()}

        <Player
      elapsed="1:25"
      //{Math.round((this.state.songProgress*100))%this.state.playQueue[this.state.nowPlayingCurrentSong].length}
      progress={this.state.songProgress}
      togglePlayCallback={this.togglePlayCallback.bind(this)}
      nextCallback={this.playerNextCallback.bind(this)}
      prevCallback={this.playerPrevCallback.bind(this)}
      playStatus={this.state.playStatus}
        />
        </div>
    );
  }

}

AppContainer.YT_API_KEY =  'AIzaSyCIM4EzNqi1in22f4Z3Ru3iYvLaY8tc3bo';
export default AppContainer;