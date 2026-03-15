 import { AuthRouter } from "./app.routes.jsx";
import { RouterProvider } from "react-router"
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { InterviewProvider } from "./features/interview/interview.context.jsx";


const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={AuthRouter} />
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App

