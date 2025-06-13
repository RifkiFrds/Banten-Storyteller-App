import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/registers/register-page";
import ViewDetailPage from "../pages/detail-story/view-detail-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import MapPage from "../pages/map/map-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/detail/:id": new ViewDetailPage(),
  "/add": new AddStoryPage(),
  "/map": new MapPage(),
};

export default routes;
