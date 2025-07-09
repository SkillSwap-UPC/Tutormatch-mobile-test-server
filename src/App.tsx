import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StatusBar } from 'react-native';
import DashboardPage from './dashboard/pages/DashboardPage';
import TutoringsBySemester from './dashboard/pages/TutoringsBySemester';
import ForgotPasswordPage from './public/pages/auth/forgot-password';
import LoginPage from './public/pages/auth/login';
import RegisterPage from './public/pages/auth/register';
import RegisterSuccessPage from './public/pages/auth/register-success';
import VerifyEmailPage from './public/pages/auth/verify-email';
import NotFoundPage from './public/pages/not-found/NotFoundPage';
import ProfilePage from './public/pages/profile/ProfilePage';
import SupportPage from './support/pages/SupportPage';
import TutoringDetailsPage from './tutoring/pages/TutoringDetailsPage';
import TutorTutoringsPage from './tutoring/pages/TutorTutoringsPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import MembershipPlansPage from './public/pages/membership/pages/MembershipPlansPage';
import MembershipWaitingPage from './public/pages/membership/pages/MembershipWaitingPage';
// import './utils/deepFix';
// import { applyDeepPatches } from './utils/deepPatches';
// import { patchReactNativeText } from './utils/patchText';
// patchReactNativeText();
// applyDeepPatches();


export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  ForgotPassword: undefined;
  RegisterSuccess: undefined;
  TutoringsBySemester: { semesterId: string };
  VerifyEmail: { email?: string; verified?: string; token?: string };
  TutoringDetails: { tutoringId: string };
  TutorTutorings: { tutorId: string };
  Profile: { userId?: string };
  Support: undefined;
  ResetPassword: { token?: string };
  NotFound: undefined;
  AdminDashboardPage: undefined;
  MembershipPlansPage: undefined;
  MembershipWaitingPage: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#121212' }
        }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Dashboard" component={DashboardPage} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
        <Stack.Screen name="TutoringsBySemester" component={TutoringsBySemester} />
        <Stack.Screen name="RegisterSuccess" component={RegisterSuccessPage} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailPage} />
        <Stack.Screen name="TutoringDetails" component={TutoringDetailsPage} />
        <Stack.Screen name="TutorTutorings" component={TutorTutoringsPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="Support" component={SupportPage} />
        <Stack.Screen name="NotFound" component={NotFoundPage} />
        <Stack.Screen name="AdminDashboardPage" component={AdminDashboardPage} />
        <Stack.Screen name="MembershipPlansPage" component={MembershipPlansPage} />
        <Stack.Screen name="MembershipWaitingPage" component={MembershipWaitingPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;