from engine import ZerotypeEngine

if __name__ == "__main__":
    try:
        engine = ZerotypeEngine()
        engine.run()
    except KeyboardInterrupt:
        pass
    except Exception as e:
        import traceback
        traceback.print_exc()
