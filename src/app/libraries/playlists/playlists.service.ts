import { Injectable } from "@angular/core";
import { HttpService } from "../../http.service";
import { Store } from "@ngrx/store";
import { Playlist, PlaylistSet } from "../playlist";
import * as PlaylistActions from "./store/playlists.actions";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PlaylistsService {
  private currentPlaylistSet$: Observable<PlaylistSet>;

  constructor(
    private httpClient: HttpService,
    private store: Store<{
      libraries: { playlists: { currentSet: Playlist[] } };
    }>
  ) {}

  populateMyPlaylists() {
    this.selectNgrxPlaylists();
    this.store.dispatch(new PlaylistActions.PopulateMyPlaylists());
  }

  selectNgrxPlaylists() {
    this.currentPlaylistSet$ = this.getFeatureStoreObservable("currentSet");
  }

  getFeatureStoreObservable(key: string): Observable<any> {
    return this.store.select("libraries", "playlists", key);
  }

  /**
   * Add the tracks that are currently selected to the playlist ID
   */
  postSelectedTracksToSelectedPlaylist(tracks, playlistId): void {
    this.httpClient.postTracksToPlaylist(tracks, playlistId);
  }
}
