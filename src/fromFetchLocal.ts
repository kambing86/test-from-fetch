import { Observable } from "rxjs";

export default function fromFetch(
  input: string | Request,
  init?: RequestInit
): Observable<Response> {
  return new Observable<Response>(subscriber => {
    const controller = new AbortController();
    const signal = controller.signal;
    let abortable = true;
    let unsubscribed = false;

    if (init) {
      // If a signal is provided, just have it teardown. It's a cancellation token, basically.
      if (init.signal) {
        init.signal.addEventListener("abort", () => {
          if (!signal.aborted) {
            controller.abort();
          }
        });
      }
      init.signal = signal;
    } else {
      init = { signal };
    }

    fetch(input, init)
      .then(response => {
        abortable = false;
        subscriber.next(response);
        subscriber.complete();
      })
      .catch(err => {
        abortable = false;
        if (!unsubscribed) {
          // Only forward the error if it wasn't an abort.
          subscriber.error(err);
        }
      });

    return () => {
      unsubscribed = true;
      if (abortable) {
        controller.abort();
      }
    };
  });
}
