import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

/** Keep DOM HUD/plate alive if R3F Canvas / WebGL fails (headless shot envs). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="webgl-fallback" role="alert">
            <p>3D 舞台不可用（WebGL）</p>
            <pre>{this.state.error.message}</pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
