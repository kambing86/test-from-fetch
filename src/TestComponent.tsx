import React, { useState, useCallback } from "react";
import { of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import fromFetchLocal from "./fromFetchLocal";
import { mergeMap, retry, tap, finalize } from "rxjs/operators";

const testApi = "https://httpstat.us/200?sleep=2000";

export default function TestComponent() {
  const [result1, setResult1] = useState();
  const [result2, setResult2] = useState();
  const [result3, setResult3] = useState();
  const onClick = useCallback(() => {
    setResult1("");
    setResult2("");
    setResult3("");
    const sub1 = of(testApi + "&id=sub1")
      .pipe(
        mergeMap(api => fromFetch(api)),
        retry(2),
        mergeMap(res => res.text()),
        tap(text => {
          setResult1(text);
        }),
        finalize(() => {
          setResult1("finalize");
        })
      )
      .subscribe();
    const sub2 = fromFetch(testApi + "&id=sub2")
      .pipe(
        mergeMap(res => res.text()),
        retry(2),
        tap(text => {
          setResult2(text);
        }),
        finalize(() => {
          setResult2("finalize");
        })
      )
      .subscribe();
    const sub3 = fromFetchLocal(testApi + "&id=sub3")
      .pipe(
        mergeMap(res => res.text()),
        retry(2),
        tap(text => {
          setResult3(text);
        }),
        finalize(() => {
          setResult3("finalize");
        })
      )
      .subscribe();
    setTimeout(() => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    }, 1000);
  }, []);
  return (
    <>
      <div>Result1: {result1}</div>
      <div>Result2: {result2}</div>
      <div>Result3: {result3}</div>
      <button onClick={onClick}>Test</button>
    </>
  );
}
