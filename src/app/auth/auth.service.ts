import { Injectable, OnDestroy } from "@angular/core";
import { ApiEndpointsService } from "../api-endpoints.service";
import { Store } from "@ngrx/store";

import { ActivatedRouteSnapshot, ActivationEnd } from "@angular/router";
import UtilsService from "../utils.service";
import { Observable, Subscription } from "rxjs";

import * as AuthActions from "./store/auth.actions";
import { HttpService } from "../http.service";
import { environment } from "src/environments/environment.prod";

@Injectable({
  providedIn: "root"
})
export class AuthService implements OnDestroy {
  readonly localStorageCacheKeys = {
    clientState: "clientState"
  };

  private clientState: string = "";
  private subscription: Subscription;

  constructor(
    private store: Store<{
      auth: { clientState: string };
    }>,
    private endpointsService: ApiEndpointsService,
    private http: HttpService
  ) {
    this.store.select("auth").subscribe(auth => {
      this.clientState = auth.clientState;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  populateStoreClientState(): void {
    const stateToUse =
      localStorage.getItem(this.localStorageCacheKeys.clientState) ||
      UtilsService.getGeneratedRandomString();
    debugger;

    this.store.dispatch(new AuthActions.SetClientState(stateToUse));
    localStorage.setItem(this.localStorageCacheKeys.clientState, stateToUse);
  }

  /**
   * Redirect user to spotify.accounts/authorize
   * to get valid token if not logged in
   */
  authenticate(accessToken: string, returnedState: string): void {
    let href = "";
    debugger;
    if (returnedState && returnedState === this.clientState) {
      // set login state
      this.login(accessToken);
      debugger;

      // do not redirect
      return;
    } else if (returnedState && returnedState !== this.clientState) {
      // if state doesn't match redirect to home
      href = window.location.host;
    } else {
      // redirect to spotify auth url
      href = this.endpointsService.getAuthenticationUrl();
    }
    // If user is not logged in, try to
    UtilsService.redirectTo(href);
  }

  async refreshToken(accessToken: string) {
    this.http
      .postApiRequest(this.endpointsService.getRefreshtokenUrl(), {
        headers: {
          ...this.http.getRefreshTokenHeaders()
        },
        grant_type: environment.apiConfig.grant_type,
        refresh_token: accessToken
      })
      .then(data => {
        debugger;
      });
  }

  login(accessToken: string): void {
    this.store.dispatch(new AuthActions.SetAuth(accessToken));
    this.store.dispatch(new AuthActions.SetStateValidity(true));
  }

  logout(): void {
    this.store.dispatch(new AuthActions.SetStateValidity(false));
    this.store.dispatch(new AuthActions.SetAuth(""));
  }
}
