function norminf(v) {
  var res = 0;
  for (var i = 0; i < v.length; i++) {
    res = Math.max(Math.abs(v[i]), res);
  }
  return res;
}
function sub(v1, v2) {
  var res = new Array(v1.length);
  for (var i = 0; i < v1.length; i++) {
    res[i] = v1[i] - v2[i];
  }
  return res;
}
function add(v1, v2) {
  var res = new Array(v1.length);
  for (var i = 0; i < v1.length; i++) {
    res[i] = v1[i] + v2[i];
  }
  return res;
}
function mul(scal, vec) {
  if (Array.isArray(scal)) {
    var tmp = vec;
    vec = scal;
    scal = tmp;
  }
  var res = new Array(vec.length);
  for (var i = 0; i < vec.length; i++) {
    res[i] = scal * vec[i];
  }
  return res;
}

function Dopri(x, y, f, ymid, iterations, msg, events) {
  this.x = x;
  this.y = y;
  this.f = f;
  this.ymid = ymid;
  this.iterations = iterations;
  this.events = events;
  this.message = msg;
}
Dopri.prototype._at = function _at(xi, j) {
  function sqr(x) {
    return x * x;
  }
  var sol = this;
  var xs = sol.x;
  var ys = sol.y;
  var k1 = sol.f;
  var ymid = sol.ymid;
  var n = xs.length;
  var x0, x1, xh, y0, y1, yh, xi;
  var floor = Math.floor,
    h;
  var c = 0.5;
  var p, q, w;
  x0 = xs[j];
  x1 = xs[j + 1];
  y0 = ys[j];
  y1 = ys[j + 1];
  h = x1 - x0;
  xh = x0 + c * h;
  yh = ymid[j];
  p = sub(k1[j], mul(y0, 1 / (x0 - xh) + 2 / (x0 - x1)));
  q = sub(k1[j + 1], mul(y1, 1 / (x1 - xh) + 2 / (x1 - x0)));
  w = [
    (sqr(xi - x1) * (xi - xh)) / sqr(x0 - x1) / (x0 - xh),
    (sqr(xi - x0) * sqr(xi - x1)) / sqr(x0 - xh) / sqr(x1 - xh),
    (sqr(xi - x0) * (xi - xh)) / sqr(x1 - x0) / (x1 - xh),
    ((xi - x0) * sqr(xi - x1) * (xi - xh)) / sqr(x0 - x1) / (x0 - xh),
    ((xi - x1) * sqr(xi - x0) * (xi - xh)) / sqr(x0 - x1) / (x1 - xh),
  ];
  return add(
    add(add(add(mul(y0, w[0]), mul(yh, w[1])), mul(y1, w[2])), mul(p, w[3])),
    mul(q, w[4]),
  );
};
Dopri.prototype.at = function at(x) {
  var i,
    j,
    k,
    floor = Math.floor;
  if (typeof x !== "number") {
    var n = x.length,
      ret = Array(n);
    for (i = n - 1; i !== -1; --i) {
      ret[i] = this.at(x[i]);
    }
    return ret;
  }
  var x0 = this.x;
  i = 0;
  j = x0.length - 1;
  while (j - i > 1) {
    k = floor(0.5 * (i + j));
    if (x0[k] <= x) i = k;
    else j = k;
  }
  return this._at(x, i);
};

export function dopri(x0, x1, y0, f, tol, maxit, event) {
  if (typeof tol === "undefined") {
    tol = 1e-6;
  }
  if (typeof maxit === "undefined") {
    maxit = 1000;
  }
  var xs = [x0],
    ys = [y0],
    k1 = [f(x0, y0)],
    k2,
    k3,
    k4,
    k5,
    k6,
    k7,
    ymid = [];
  var A2 = 1 / 5;
  var A3 = [3 / 40, 9 / 40];
  var A4 = [44 / 45, -56 / 15, 32 / 9];
  var A5 = [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729];
  var A6 = [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656];
  var b = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84];
  var bm = [
    (0.5 * 6025192743) / 30085553152,
    0,
    (0.5 * 51252292925) / 65400821598,
    (0.5 * -2691868925) / 45128329728,
    (0.5 * 187940372067) / 1594534317056,
    (0.5 * -1776094331) / 19743644256,
    (0.5 * 11237099) / 235043384,
  ];
  var c = [1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
  var e = [
    -71 / 57600,
    0,
    71 / 16695,
    -71 / 1920,
    17253 / 339200,
    -22 / 525,
    1 / 40,
  ];
  var i = 0,
    er,
    j;
  var h = (x1 - x0) / 10;
  var it = 0;
  var y1, erinf;
  var max = Math.max,
    min = Math.min,
    abs = Math.abs,
    pow = Math.pow;
  var any = any,
    lt = lt,
    and = and,
    sub = sub;
  var e0, e1, ev;
  var ret = new Dopri(xs, ys, k1, ymid, -1, "");
  if (typeof event === "function") e0 = event(x0, y0);
  while (x0 < x1 && it < maxit) {
    ++it;
    if (x0 + h > x1) h = x1 - x0;
    k2 = f(x0 + c[0] * h, add(y0, mul(A2 * h, k1[i])));
    k3 = f(
      x0 + c[1] * h,
      add(add(y0, mul(A3[0] * h, k1[i])), mul(A3[1] * h, k2)),
    );
    k4 = f(
      x0 + c[2] * h,
      add(
        add(add(y0, mul(A4[0] * h, k1[i])), mul(A4[1] * h, k2)),
        mul(A4[2] * h, k3),
      ),
    );
    k5 = f(
      x0 + c[3] * h,
      add(
        add(
          add(add(y0, mul(A5[0] * h, k1[i])), mul(A5[1] * h, k2)),
          mul(A5[2] * h, k3),
        ),
        mul(A5[3] * h, k4),
      ),
    );
    k6 = f(
      x0 + c[4] * h,
      add(
        add(
          add(
            add(add(y0, mul(A6[0] * h, k1[i])), mul(A6[1] * h, k2)),
            mul(A6[2] * h, k3),
          ),
          mul(A6[3] * h, k4),
        ),
        mul(A6[4] * h, k5),
      ),
    );
    y1 = add(
      add(
        add(
          add(add(y0, mul(k1[i], h * b[0])), mul(k3, h * b[2])),
          mul(k4, h * b[3]),
        ),
        mul(k5, h * b[4]),
      ),
      mul(k6, h * b[5]),
    );
    k7 = f(x0 + h, y1);
    er = add(
      add(
        add(
          add(add(mul(k1[i], h * e[0]), mul(k3, h * e[2])), mul(k4, h * e[3])),
          mul(k5, h * e[4]),
        ),
        mul(k6, h * e[5]),
      ),
      mul(k7, h * e[6]),
    );
    if (typeof er === "number") erinf = abs(er);
    else erinf = norminf(er);
    if (erinf > tol) {
      // reject
      h = 0.2 * h * pow(tol / erinf, 0.25);
      if (x0 + h === x0) {
        ret.msg = "Step size became too small";
        break;
      }
      continue;
    }
    ymid[i] = add(
      add(
        add(
          add(
            add(add(y0, mul(k1[i], h * bm[0])), mul(k3, h * bm[2])),
            mul(k4, h * bm[3]),
          ),
          mul(k5, h * bm[4]),
        ),
        mul(k6, h * bm[5]),
      ),
      mul(k7, h * bm[6]),
    );
    ++i;
    xs[i] = x0 + h;
    ys[i] = y1;
    k1[i] = k7;
    if (typeof event === "function") {
      var yi,
        xl = x0,
        xr = x0 + 0.5 * h,
        xi;
      e1 = event(xr, ymid[i - 1]);
      ev = and(lt(e0, 0), lt(0, e1));
      if (!any(ev)) {
        xl = xr;
        xr = x0 + h;
        e0 = e1;
        e1 = event(xr, y1);
        ev = and(lt(e0, 0), lt(0, e1));
      }
      if (any(ev)) {
        var xc, yc, en, ei;
        var side = 0,
          sl = 1.0,
          sr = 1.0;
        while (1) {
          if (typeof e0 === "number")
            xi = (sr * e1 * xl - sl * e0 * xr) / (sr * e1 - sl * e0);
          else {
            xi = xr;
            for (j = e0.length - 1; j !== -1; --j) {
              if (e0[j] < 0 && e1[j] > 0)
                xi = min(
                  xi,
                  (sr * e1[j] * xl - sl * e0[j] * xr) /
                    (sr * e1[j] - sl * e0[j]),
                );
            }
          }
          if (xi <= xl || xi >= xr) break;
          yi = ret._at(xi, i - 1);
          ei = event(xi, yi);
          en = and(lt(e0, 0), lt(0, ei));
          if (any(en)) {
            xr = xi;
            e1 = ei;
            ev = en;
            sr = 1.0;
            if (side === -1) sl *= 0.5;
            else sl = 1.0;
            side = -1;
          } else {
            xl = xi;
            e0 = ei;
            sl = 1.0;
            if (side === 1) sr *= 0.5;
            else sr = 1.0;
            side = 1;
          }
        }
        y1 = ret._at(0.5 * (x0 + xi), i - 1);
        ret.f[i] = f(xi, yi);
        ret.x[i] = xi;
        ret.y[i] = yi;
        ret.ymid[i - 1] = y1;
        ret.events = ev;
        ret.iterations = it;
        return ret;
      }
    }
    x0 += h;
    y0 = y1;
    e0 = e1;
    h = min(0.8 * h * pow(tol / erinf, 0.25), 4 * h);
  }
  ret.iterations = it;
  return ret;
}
