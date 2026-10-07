import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useEffect, useRef, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

export type Effect = {
  id: string;
  label: string;
  countdownSeconds?: number;
  onCountdownEnd?: () => void;
};

export type EffectsBannerProps = {
  effects: Effect[];
  title?: string;
  defaultExpanded?: boolean;
};

const COLORS = {
  text: "#FFFFFF",
  shadow: "#000000",
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function useCountdown(seconds?: number, onEnd?: () => void) {
  const [remaining, setRemaining] = useState<number | null>(
    seconds ?? null,
  );

  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (seconds == null) {
      setRemaining(null);
      return;
    }

    const endTime = Date.now() + seconds * 1000;

    setRemaining(seconds);

    const id = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000),
      );

      setRemaining(secondsLeft);

      if (secondsLeft === 0) {
        clearInterval(id);
        onEndRef.current?.();
      }
    }, 250);

    return () => clearInterval(id);
  }, [seconds]);

  return remaining;
}

function EffectPill({ effect }: { effect: Effect }) {
  const remaining = useCountdown(
    effect.countdownSeconds,
    effect.onCountdownEnd,
  );

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      layout={LinearTransition}
      style={styles.pill}
    >
      <LinearGradient
        colors={["#EF4444", "#892727"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <MaterialCommunityIcons
        name="hexagon-outline"
        size={26}
        color={COLORS.text}
      />

      <Text style={styles.effectText}>{effect.label}</Text>

      {remaining != null && (
        <Text style={styles.timer}>{formatTime(remaining)}</Text>
      )}
    </Animated.View>
  );
}

export function EffectsBanner({
  effects,
  title,
  defaultExpanded = true,
}: EffectsBannerProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (effects.length === 0) {
    return null;
  }

  const headerText =
    title ?? `${effects.length} effect${effects.length === 1 ? "" : "s"} active`;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top }]}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`${headerText}. ${
          expanded ? "Collapse" : "Expand"
        }`}
        style={[styles.pill, styles.header]}
      >
        <LinearGradient
          colors={["#EF4444", "#892727"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Text style={styles.headerText}>{headerText}</Text>

        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={28}
          color={COLORS.text}
        />
      </Pressable>

      {expanded &&
        effects.map((effect) => (
          <EffectPill key={effect.id} effect={effect} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
    zIndex: 100,
    elevation: 100,
  },

  pill: {
    width: "46%",
    minWidth: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    elevation: 4,
  },

  header: {
    justifyContent: "center",
    minHeight: 40,
  },

  headerText: {
    flex: 1,
    textAlign: "center",
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  effectText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  timer: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});