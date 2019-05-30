import React, { useState } from "react";
import { of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import fromFetchLocal from "./fromFetchLocal";
import { mergeMap, retry, tap } from "rxjs/operators";

const testApi = "https://httpstat.us/200?sleep=2000";

export default function TestComponent() {
  const [result1, setResult1] = useState();
  const [result2, setResult2] = useState();
  const [result3, setResult3] = useState();
  const onClick = () => {
    const sub1 = of(testApi)
      .pipe(
        mergeMap(api => fromFetch(api)),
        retry(2),
        mergeMap(res => res.text()),
        tap(text => {
          setResult1(text);
        })
      )
      .subscribe();
    const sub2 = fromFetch(testApi)
      .pipe(
        mergeMap(res => res.text()),
        retry(2),
        tap(text => {
          setResult2(text);
        })
      )
      .subscribe();
    const sub3 = fromFetchLocal(testApi)
      .pipe(
        mergeMap(res => res.text()),
        retry(2),
        tap(text => {
          setResult3(text);
        })
      )
      .subscribe();
    setTimeout(() => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    }, 1000);
  };
  return (
    <>
      <div>Result1: {result1}</div>
      <div>Result2: {result2}</div>
      <div>Result3: {result3}</div>
      <button onClick={onClick}>Test</button>
    </>
  );
}
