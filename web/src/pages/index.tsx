import { Route, Router, RouteSectionProps } from "@solidjs/router";
import { lazy } from "solid-js";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const CollegeJob = lazy(() => import("./college-job"));
const Scores = lazy(() => import("./scores"));
const CollegeType = lazy(() => import("./college-type"));
const MajorJob = lazy(() => import("./major-job"));

function Layout(props: RouteSectionProps) {
  return (
    <>
      <Nav />
      <div class="container mx-auto min-h-[calc(100vh-118px)]">
        {props.children}
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={CollegeJob} />
      <Route path="/college-job" component={CollegeJob} />
      <Route path="/college-type" component={CollegeType} />
      <Route path="/major-job" component={MajorJob} />
      <Route path="/scores" component={Scores} />
    </Router>
  );
}
