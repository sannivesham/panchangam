"""
Numerical Root Finder for Astronomical Transitions
Uses bracket detection, Brent's method, and bisection to find exact boundary crossing timestamps to sub-second precision.
"""

from typing import Callable, List, Tuple, Optional
import math


def angle_diff(current_angle: float, target_angle: float) -> float:
    """
    Returns minimal signed angular difference: current - target in range [-180, 180).
    Negative means current has not yet reached target.
    Positive means current has passed target.
    """
    diff = (current_angle - target_angle) % 360.0
    if diff >= 180.0:
        diff -= 360.0
    return diff


def find_transition_in_bracket(
    angle_func: Callable[[float], float],
    target_angle: float,
    t_start: float,
    t_end: float,
    tol_days: float = 1.0 / 86400.0,  # 1 second in days (~1.157e-5)
    max_iter: int = 50,
) -> float:
    """
    Finds root t in [t_start, t_end] where angle_func(t) == target_angle using Brent's method / bisection.
    """
    a = t_start
    b = t_end
    fa = angle_diff(angle_func(a), target_angle)
    fb = angle_diff(angle_func(b), target_angle)

    if abs(fa) < 1e-9:
        return a
    if abs(fb) < 1e-9:
        return b

    # If both endpoints have same sign, check midpoint or bracket refinement
    if fa * fb > 0:
        # Fallback to search within bracket
        steps = 10
        dt = (b - a) / steps
        for i in range(steps):
            t1 = a + i * dt
            t2 = t1 + dt
            f1 = angle_diff(angle_func(t1), target_angle)
            f2 = angle_diff(angle_func(t2), target_angle)
            if f1 * f2 <= 0:
                a, b, fa, fb = t1, t2, f1, f2
                break
        else:
            # If still same sign, return the point closer to 0
            return a if abs(fa) < abs(fb) else b

    # Brent's method for root finding
    c = a
    fc = fa
    d = e = b - a

    for _ in range(max_iter):
        if (fb > 0.0 and fc > 0.0) or (fb < 0.0 and fc < 0.0):
            c = a
            fc = fa
            d = e = b - a

        if abs(fc) < abs(fb):
            a, b, c = b, c, b
            fa, fb, fc = fb, fc, fb

        tol = 2.0 * 1e-12 * abs(b) + 0.5 * tol_days
        m = 0.5 * (c - b)

        if abs(m) <= tol or fb == 0.0 or abs(fb) < 1e-9:
            return b

        if abs(e) >= tol and abs(fa) > abs(fb):
            s = fb / fa
            if a == c:
                # Linear interpolation
                p = 2.0 * m * s
                q = 1.0 - s
            else:
                # Inverse quadratic interpolation
                q = fa / fc
                r = fb / fc
                p = s * (2.0 * m * q * (q - r) - (b - a) * (r - 1.0))
                q = (q - 1.0) * (r - 1.0) * (s - 1.0)

            if p > 0.0:
                q = -q
            else:
                p = -p

            s = e
            e = d

            if 2.0 * p < (3.0 * m * q - abs(tol * q)) and p < abs(0.5 * s * q):
                d = p / q
            else:
                d = m
                e = m
        else:
            # Bisection
            d = m
            e = m

        a = b
        fa = fb
        if abs(d) > tol:
            b += d
        elif m > 0.0:
            b += tol
        else:
            b -= tol

        fb = angle_diff(angle_func(b), target_angle)

    return b


def find_all_transitions_in_range(
    angle_func: Callable[[float], float],
    step_size_deg: float,
    t_start: float,
    t_end: float,
    coarse_step_hours: float = 1.0,
) -> List[Tuple[float, int, int]]:
    """
    Finds all transitions of a celestial quantity stepping by step_size_deg between t_start and t_end.
    Returns list of (transition_jd, from_index, to_index).
    Index is 1-based: floor(angle / step_size_deg) + 1.
    """
    total_steps = int(round(360.0 / step_size_deg))
    dt_coarse = coarse_step_hours / 24.0

    transitions = []
    t_curr = t_start
    angle_curr = angle_func(t_curr) % 360.0
    idx_curr = int(angle_curr // step_size_deg) + 1

    while t_curr < t_end:
        t_next = min(t_curr + dt_coarse, t_end)
        angle_next = angle_func(t_next) % 360.0
        idx_next = int(angle_next // step_size_deg) + 1

        if idx_next != idx_curr:
            # Boundary crossing occurred in [t_curr, t_next]
            # Handle wrapping across 360 (e.g. from total_steps to 1)
            target_boundary = ((idx_curr * step_size_deg)) % 360.0
            t_transition = find_transition_in_bracket(angle_func, target_boundary, t_curr, t_next)
            transitions.append((t_transition, idx_curr, idx_next))
            idx_curr = idx_next

        t_curr = t_next

    return transitions
