import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { format, differenceInSeconds, addHours } from 'date-fns';
import { useFastingState } from './hooks/useFastingState';
import { FASTING_PHASES } from './utils/notifications';

const DURATION_OPTIONS = [16, 18, 20, 24, 36, 48, 72, 120];

export default function App() {
  return (
    <SafeAreaProvider>
      <FastingTracker />
    </SafeAreaProvider>
  );
}

function FastingTracker() {
  const { isFasting, startTime, targetDuration, isLoading, startFast, endFast } = useFastingState();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let interval;
    if (isFasting && startTime) {
      const updateElapsed = () => {
        const diff = differenceInSeconds(new Date(), new Date(startTime));
        setElapsedSeconds(diff > 0 ? diff : 0);
      };
      updateElapsed(); // initial call
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const targetSeconds = targetDuration * 3600;
  let progress = (elapsedSeconds / targetSeconds) * 100;
  if (progress > 100) progress = 100;

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Long Fasting Tracker</Text>
          <Text style={styles.headerSubtitle}>
            {isFasting ? `Target: ${targetDuration}h` : 'Ready to start?'}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <CircularProgress
            value={progress}
            radius={120}
            duration={1000}
            progressValueColor={'#4caf50'}
            maxValue={100}
            title={isFasting ? formatTime(elapsedSeconds) : '00:00:00'}
            titleColor={'#fff'}
            titleStyle={{ fontWeight: 'bold', fontSize: 32 }}
            subtitle={isFasting ? `Remaining: ${formatTime(remainingSeconds)}` : `Goal: ${targetDuration}h`}
            subtitleColor={'#aaa'}
            activeStrokeColor={'#4caf50'}
            inActiveStrokeColor={'#2c2c2c'}
            inActiveStrokeOpacity={0.5}
            activeStrokeWidth={15}
            inActiveStrokeWidth={15}
            valueSuffix={'%'}
          />
        </View>

        <View style={styles.controlsContainer}>
          {!isFasting ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.primaryButtonText}>START FAST</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.dangerButton} onPress={endFast}>
              <Text style={styles.primaryButtonText}>END FAST</Text>
            </TouchableOpacity>
          )}
        </View>

        {isFasting && startTime && (
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Fasting Phases</Text>
            {FASTING_PHASES.map((phase) => {
              const phaseTime = addHours(new Date(startTime), phase.hours);
              const hasReached = new Date() >= phaseTime;

              return (
                <View key={phase.id} style={[styles.phaseItem, hasReached && styles.phaseItemReached]}>
                  <View style={styles.phaseHeader}>
                    <Text style={[styles.phaseTitle, hasReached && styles.phaseTextReached]}>
                      {phase.hours}h: {phase.title}
                    </Text>
                    <Text style={styles.phaseTime}>
                      {format(phaseTime, 'MMM d, h:mm a')}
                    </Text>
                  </View>
                  <Text style={styles.phaseBody}>{phase.body}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Fast Duration</Text>
            <ScrollView style={styles.modalScroll}>
              {DURATION_OPTIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={styles.durationOption}
                  onPress={() => {
                    setModalVisible(false);
                    startFast(duration);
                  }}
                >
                  <Text style={styles.durationOptionText}>{duration} Hours</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  controlsContainer: {
    width: '100%',
    marginVertical: 30,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineContainer: {
    width: '100%',
    marginTop: 20,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  phaseItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#444',
  },
  phaseItemReached: {
    borderLeftColor: '#4caf50',
    backgroundColor: '#1a2e1e',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
  },
  phaseTextReached: {
    color: '#fff',
  },
  phaseTime: {
    fontSize: 12,
    color: '#888',
  },
  phaseBody: {
    fontSize: 14,
    color: '#aaa',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  durationOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  durationOptionText: {
    fontSize: 18,
    color: '#4caf50',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 15,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});
