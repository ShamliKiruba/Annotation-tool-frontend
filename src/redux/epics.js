import { combineEpics, ofType } from 'redux-observable';
import * as actions from './actions';
import { mergeMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';


const saveDataEpic = (action$, state$) => action$.pipe(
  ofType(actions.SAVE_DATA),
  mergeMap((payload) => ajax({
    url: 'http://localhost:3000/saveAnnotation',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload.value
  }).pipe(
    map(response => actions.getDataSuccess(payload.value))
  )
));

const retrieveDataEpic = (action$, state$) => action$.pipe(
  ofType(actions.GET_DATA),
  mergeMap(({ payload }) => ajax.getJSON('http://localhost:3000/getAnnotation').pipe(
    map(response => actions.getDataSuccess(response))
  )
));

const rootEpic = combineEpics(
  saveDataEpic,
  retrieveDataEpic
);

export default rootEpic;
