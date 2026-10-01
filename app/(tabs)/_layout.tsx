import React from 'react';
import type { ComponentType } from 'react';
import { Tabs } from 'expo-router';
import { Camera, ClipboardList, BarChart2, User } from 'lucide-react-native';

import { dark } from '@/theme/colors';
import { useTranslation } from '@/lib/i18n';

// react-native-svg is a native dep not present at typecheck time, so LucideProps
// can't resolve SvgProps. Cast icons to accept stroke/size at the call site.
type IconProps = { stroke: string; size: number; strokeWidth: number };
function icon(Icon: ComponentType<IconProps>) {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon stroke={color} size={size} strokeWidth={2} />
  );
}

// The tab bar uses dark chrome tokens — the lens is always dark regardless of system theme.
const TAB_BAR_STYLE = {
  backgroundColor: dark.surface,
  borderTopColor: dark.border,
} as const;

export default function TabsLayout() {
  const t = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarActiveTintColor: dark.accent,
        tabBarInactiveTintColor: dark.textSecondary,
      }}
    >
      <Tabs.Screen name="index"   options={{ title: t.tabs.lens,    tabBarIcon: icon(Camera as ComponentType<IconProps>) }} />
      <Tabs.Screen name="log"     options={{ title: t.tabs.log,     tabBarIcon: icon(ClipboardList as ComponentType<IconProps>) }} />
      <Tabs.Screen name="month"   options={{ title: t.tabs.month,   tabBarIcon: icon(BarChart2 as ComponentType<IconProps>) }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profile, tabBarIcon: icon(User as ComponentType<IconProps>) }} />
    </Tabs>
  );
}
